/**
 * Pre-mint N HD deposit addresses into the pool (optional warm-up).
 * Usage: TRON_DEPOSIT_MNEMONIC="..." DATABASE_URL="..." npx tsx scripts/generate-deposit-addresses.ts 10
 */
import "dotenv/config";
import { mintNextPoolDepositAddress, isTronHdConfigured } from "../src/server/tron-hd-wallet";

async function main() {
  if (!isTronHdConfigured()) {
    console.error("Set a valid TRON_DEPOSIT_MNEMONIC in the environment.");
    process.exit(1);
  }
  const count = Number(process.argv[2] ?? "5");
  for (let i = 0; i < count; i++) {
    const d = await mintNextPoolDepositAddress();
    console.log(i + 1, d?.address, "index", d?.derivationIndex, d?.path);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
