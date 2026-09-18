import { eq } from "drizzle-orm";
import { accounts, auditLogs, indexerCursors } from "../../drizzle/schema";
import { getDb } from "@/lib/db";
import { confirmTrc20Deposit } from "./deposit-service";

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

interface IndexerResult {
  scanned: number;
  confirmed: number;
  skipped: number;
  errors: string[];
}

async function fetchTrc20Incoming(
  address: string,
  minTimestampMs: number,
): Promise<TronTrc20Transfer[]> {
  const host = process.env.TRON_FULL_HOST ?? "https://api.trongrid.io";
  const apiKey = process.env.TRON_API_KEY;
  const url = new URL(`/v1/accounts/${address}/transactions/trc20`, host);
  url.searchParams.set("limit", "50");
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
  const whole = Number(raw / div);
  const frac = Number(raw % div) / Number(div);
  return whole + frac;
}

export async function indexTronDepositsForAccount(
  accountId: string,
  depositAddress: string,
): Promise<{ confirmed: number; skipped: number }> {
  const db = getDb();
  let confirmed = 0;
  let skipped = 0;

  const cursor = await db.query.indexerCursors.findFirst({
    where: eq(indexerCursors.address, depositAddress),
  });
  const minTs = cursor ? Number(cursor.lastSeenMs) : 0;

  const transfers = await fetchTrc20Incoming(depositAddress, minTs);
  let maxTs = minTs;

  for (const tx of transfers) {
    if (tx.block_timestamp > maxTs) maxTs = tx.block_timestamp;
    const symbol = tx.token_info?.symbol?.toUpperCase();
    if (symbol && symbol !== "USDT") {
      skipped += 1;
      continue;
    }
    const decimals = Number(tx.token_info?.decimals ?? 6);
    const amount = parseUsdtAmount(tx.value, decimals);
    if (amount <= 0) {
      skipped += 1;
      continue;
    }

    try {
      const result = await confirmTrc20Deposit({
        accountId,
        txHash: tx.transaction_id,
        amountUsdt: amount,
      });
      if (result.credited > 0) confirmed += 1;
      else skipped += 1;
    } catch (e) {
      skipped += 1;
      console.warn("Deposit confirm skip", tx.transaction_id, e);
    }
  }

  await db
    .insert(indexerCursors)
    .values({
      address: depositAddress,
      lastSeenMs: String(maxTs),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: indexerCursors.address,
      set: { lastSeenMs: String(maxTs), updatedAt: new Date() },
    });

  return { confirmed, skipped };
}

/** Scan all assigned deposit addresses and auto-confirm new USDT TRC-20 transfers. */
export async function runTronDepositIndexer(): Promise<IndexerResult> {
  const db = getDb();
  const watched = await db.select().from(accounts);
  const targets = watched.filter((a) => a.depositAddressTrc20);

  const result: IndexerResult = {
    scanned: targets.length,
    confirmed: 0,
    skipped: 0,
    errors: [],
  };

  for (const acct of targets) {
    const addr = acct.depositAddressTrc20!;
    try {
      const r = await indexTronDepositsForAccount(acct.id, addr);
      result.confirmed += r.confirmed;
      result.skipped += r.skipped;
    } catch (e) {
      result.errors.push(
        `${addr}: ${e instanceof Error ? e.message : "index failed"}`,
      );
    }
  }

  await db.insert(auditLogs).values({
    action: "tron_deposit_indexer_run",
    metadata: result,
  });

  return result;
}
