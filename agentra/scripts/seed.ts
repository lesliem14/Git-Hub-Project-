import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../drizzle/schema";
import { DEMO_ACCOUNT_ID } from "../src/lib/constants";

const DEMO_USER_ID = "00000000-0000-4000-8000-000000000099";
const DEMO_DEPOSIT = "TXkPq8vN2mR7sL4wY9hJ3fG6dA1cB5eH8n";

const POOL_ADDRESSES = [
  DEMO_DEPOSIT,
  "TY7mN3pQ9wR2xK5vL8hJ1fD4cA6bE0gH9s",
  "TZ3nM8qP1wR6xK2vL5hJ9fD0cA4bE7gH3s",
  "TA9mK4pQ2wR8xL1vN6hJ5fD3cB0eG2hH7s",
  "TB2mL7pQ5wR3xM9vO1hJ8fD6cC5eG4hH1s",
];

async function main() {
  const url = process.env.DATABASE_URL ?? "postgres://agentra:agentra_dev@localhost:5432/agentra";
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  const passwordHash = await bcrypt.hash("agentra-demo-2024", 12);

  await db
    .insert(schema.users)
    .values({
      id: DEMO_USER_ID,
      email: "trader@agentra.local",
      username: "agentra_trader",
      passwordHash,
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { passwordHash },
    });

  await db
    .insert(schema.accounts)
    .values({
      id: DEMO_ACCOUNT_ID,
      userId: DEMO_USER_ID,
      evmAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      usdtTrc20Payout: DEMO_DEPOSIT,
      depositAddressTrc20: DEMO_DEPOSIT,
      referralCode: "AGT-demo8K2",
      licenseActivated: true,
    })
    .onConflictDoUpdate({
      target: schema.accounts.id,
      set: {
        depositAddressTrc20: DEMO_DEPOSIT,
        usdtTrc20Payout: DEMO_DEPOSIT,
      },
    });

  for (const address of POOL_ADDRESSES) {
    await db
      .insert(schema.depositAddressPool)
      .values({ address })
      .onConflictDoNothing();
  }
  await db
    .update(schema.depositAddressPool)
    .set({ accountId: DEMO_ACCOUNT_ID, assignedAt: new Date() })
    .where(eq(schema.depositAddressPool.address, DEMO_DEPOSIT));

  await db
    .insert(schema.ledgerAccounts)
    .values({
      accountId: DEMO_ACCOUNT_ID,
      availableUsdt: "372.45",
      licenseCreditUsdt: "100",
      lockedInTradeUsdt: "183",
      pendingWithdrawableUsdt: "42.18",
    })
    .onConflictDoUpdate({
      target: schema.ledgerAccounts.accountId,
      set: {
        availableUsdt: "372.45",
        licenseCreditUsdt: "100",
        lockedInTradeUsdt: "183",
        pendingWithdrawableUsdt: "42.18",
      },
    });

  const started = new Date(Date.now() - 45 * 60 * 1000);
  const existingLock = await db.query.tradeLocks.findFirst({
    where: eq(schema.tradeLocks.accountId, DEMO_ACCOUNT_ID),
  });
  if (!existingLock) {
    await db.insert(schema.tradeLocks).values({
      accountId: DEMO_ACCOUNT_ID,
      amountUsdt: "183",
      startedAt: started,
      releasesAt: new Date(started.getTime() + 2 * 60 * 60 * 1000),
      strategy: "DEX Arbitrage",
      status: "open",
    });
  }

  console.log("Seed complete.");
  console.log("Demo login: trader@agentra.local / agentra-demo-2024");
  console.log("Demo account:", DEMO_ACCOUNT_ID);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
