import { eq } from "drizzle-orm";
import { auditLogs, indexerCursors, trc20Deposits, treasuryDepositsObserved } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import {
  getTronHeaders,
  getTronFullHost,
  isUsdtTrc20Contract,
  treasuryAddressForOps,
  USDT_TRC20_CONTRACT,
} from "./tron-grid";

interface TronTrc20Transfer {
  transaction_id: string;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  token_info?: { symbol?: string; decimals?: string | number; address?: string };
}

export interface IndexerResult {
  treasury: string;
  scanned: number;
  observed: number;
  skipped: number;
  pages: number;
  errors: string[];
}

function parseUsdtAmount(value: string, decimals: number): number {
  const raw = BigInt(value);
  const div = BigInt(10 ** decimals);
  return Number(raw / div) + Number(raw % div) / Number(div);
}

async function fetchTreasuryIncomingPage(
  treasuryAddress: string,
  minTimestampMs: number,
  fingerprint?: string,
): Promise<{ data: TronTrc20Transfer[]; fingerprint?: string }> {
  const host = getTronFullHost();
  const url = new URL(`/v1/accounts/${treasuryAddress}/transactions/trc20`, host);
  url.searchParams.set("limit", "200");
  url.searchParams.set("contract_address", USDT_TRC20_CONTRACT);
  url.searchParams.set("only_to", "true");
  url.searchParams.set("order_by", "block_timestamp,asc");
  if (minTimestampMs > 0) {
    url.searchParams.set("min_timestamp", String(minTimestampMs));
  }
  if (fingerprint) url.searchParams.set("fingerprint", fingerprint);

  const res = await fetch(url.toString(), { headers: getTronHeaders(), next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`TronGrid ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data?: TronTrc20Transfer[];
    meta?: { fingerprint?: string; links?: { next?: string } };
  };
  return { data: json.data ?? [], fingerprint: json.meta?.fingerprint };
}

/**
 * Index incoming treasury USDT (any sender). Users claim with tx hash on Fund.
 */
export async function runTronDepositIndexer(): Promise<IndexerResult> {
  const db = getDb();
  const treasury = treasuryAddressForOps();
  if (!treasury) {
    throw new Error("AGENTRA_TREASURY_TRC20 is not configured");
  }

  const cursor = await db.query.indexerCursors.findFirst({
    where: eq(indexerCursors.address, treasury),
  });
  const minTs = cursor ? Number(cursor.lastSeenMs) : 0;

  const result: IndexerResult = {
    treasury,
    scanned: 0,
    observed: 0,
    skipped: 0,
    pages: 0,
    errors: [],
  };

  let fingerprint: string | undefined;
  let maxTs = minTs;
  const maxPages = parseInt(process.env.AGENTRA_TRON_INDEXER_MAX_PAGES ?? "5", 10);

  for (let page = 0; page < maxPages; page++) {
    const { data, fingerprint: nextFp } = await fetchTreasuryIncomingPage(treasury, minTs, fingerprint);
    result.pages += 1;
    result.scanned += data.length;
    fingerprint = nextFp;

    for (const tx of data) {
      if (tx.block_timestamp > maxTs) maxTs = tx.block_timestamp;
      if (tx.to !== treasury) {
        result.skipped += 1;
        continue;
      }
      const symbol = tx.token_info?.symbol?.toUpperCase();
      if (symbol && symbol !== "USDT") {
        result.skipped += 1;
        continue;
      }
      if (tx.token_info?.address && !isUsdtTrc20Contract(tx.token_info.address)) {
        result.skipped += 1;
        continue;
      }
      const decimals = Number(tx.token_info?.decimals ?? 6);
      const amount = parseUsdtAmount(tx.value, decimals);
      if (amount <= 0) {
        result.skipped += 1;
        continue;
      }

      try {
        const inserted = await db
          .insert(treasuryDepositsObserved)
          .values({
            txHash: tx.transaction_id,
            fromAddress: tx.from,
            amountUsdt: String(amount),
            blockTimestamp: String(tx.block_timestamp),
          })
          .onConflictDoNothing()
          .returning({ txHash: treasuryDepositsObserved.txHash });
        if (inserted.length) result.observed += 1;
        else result.skipped += 1;
      } catch (e) {
        result.skipped += 1;
        result.errors.push(
          `${tx.transaction_id}: ${e instanceof Error ? e.message : "observe failed"}`,
        );
      }
    }

    if (!data.length || !fingerprint) break;
  }

  if (maxTs > minTs) {
    await db
      .insert(indexerCursors)
      .values({
        address: treasury,
        lastSeenMs: String(maxTs),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: indexerCursors.address,
        set: { lastSeenMs: String(maxTs), updatedAt: new Date() },
      });
  }

  await db.insert(auditLogs).values({
    action: "tron_deposit_indexer_run",
    metadata: result,
  });

  return result;
}

/** Recent treasury deposits not yet claimed in trc20_deposits */
export async function listUnclaimedObservedDeposits(limit = 20) {
  const db = getDb();
  const claimed = await db.select({ txHash: trc20Deposits.txHash }).from(trc20Deposits);
  const claimedSet = claimed.map((c) => c.txHash);

  const rows = await db.select().from(treasuryDepositsObserved).limit(200);
  const filtered = rows
    .filter((r) => !claimedSet.includes(r.txHash))
    .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
    .slice(0, limit);

  return filtered.map((r) => ({
    txHash: r.txHash,
    fromAddress: r.fromAddress,
    amountUsdt: parseFloat(r.amountUsdt),
    blockTimestamp: r.blockTimestamp,
  }));
}
