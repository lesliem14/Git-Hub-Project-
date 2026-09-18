import { eq } from "drizzle-orm";
import { auditLogs, indexerCursors, treasuryDepositsObserved } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { getAgentraTreasuryAddress } from "@/lib/tron-utils";

const USDT_CONTRACT =
  process.env.TRON_USDT_CONTRACT ?? "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

interface TronTrc20Transfer {
  transaction_id: string;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  token_info?: { symbol?: string; decimals?: string | number };
}

export interface IndexerResult {
  treasury: string;
  scanned: number;
  observed: number;
  skipped: number;
  errors: string[];
}

async function fetchTreasuryIncoming(
  treasuryAddress: string,
  minTimestampMs: number,
): Promise<TronTrc20Transfer[]> {
  const host = process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
  const apiKey = process.env.TRON_API_KEY;
  const url = new URL(`/v1/accounts/${treasuryAddress}/transactions/trc20`, host);
  url.searchParams.set("limit", "100");
  url.searchParams.set("contract_address", USDT_CONTRACT);
  url.searchParams.set("only_to", "true");
  if (minTimestampMs > 0) {
    url.searchParams.set("min_timestamp", String(minTimestampMs));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["TRON-PRO-API-KEY"] = apiKey;

  const res = await fetch(url.toString(), { headers, next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`TronGrid ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: TronTrc20Transfer[] };
  return json.data ?? [];
}

function parseUsdtAmount(value: string, decimals: number): number {
  const raw = BigInt(value);
  const div = BigInt(10 ** decimals);
  return Number(raw / div) + Number(raw % div) / Number(div);
}

/**
 * Index incoming treasury USDT (any sender). Users claim with tx hash on the Fund page.
 */
export async function runTronDepositIndexer(): Promise<IndexerResult> {
  const db = getDb();
  const treasury = getAgentraTreasuryAddress();

  const cursor = await db.query.indexerCursors.findFirst({
    where: eq(indexerCursors.address, treasury),
  });
  const minTs = cursor ? Number(cursor.lastSeenMs) : 0;

  const transfers = await fetchTreasuryIncoming(treasury, minTs);
  let maxTs = minTs;

  const result: IndexerResult = {
    treasury,
    scanned: transfers.length,
    observed: 0,
    skipped: 0,
    errors: [],
  };

  for (const tx of transfers) {
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
    const decimals = Number(tx.token_info?.decimals ?? 6);
    const amount = parseUsdtAmount(tx.value, decimals);
    if (amount <= 0) {
      result.skipped += 1;
      continue;
    }

    try {
      await db
        .insert(treasuryDepositsObserved)
        .values({
          txHash: tx.transaction_id,
          fromAddress: tx.from,
          amountUsdt: String(amount),
          blockTimestamp: String(tx.block_timestamp),
        })
        .onConflictDoNothing();
      result.observed += 1;
    } catch (e) {
      result.skipped += 1;
      result.errors.push(
        `${tx.transaction_id}: ${e instanceof Error ? e.message : "observe failed"}`,
      );
    }
  }

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

  await db.insert(auditLogs).values({
    action: "tron_deposit_indexer_run",
    metadata: result,
  });

  return result;
}
