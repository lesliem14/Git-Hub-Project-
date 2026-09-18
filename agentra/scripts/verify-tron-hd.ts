/**
 * Verify Tron HD derivation (prints first 3 addresses — dev only).
 * Uses TRON_DEPOSIT_MNEMONIC from env; never commit real mnemonics.
 */
import "dotenv/config";
import { deriveTronDepositAddress, isTronHdConfigured } from "../src/server/tron-hd-wallet";

async function main() {
  if (!isTronHdConfigured()) {
    console.error("TRON_DEPOSIT_MNEMONIC missing or invalid.");
    process.exit(1);
  }
  const start = Number(process.env.TRON_DEPOSIT_INDEX_START ?? "0");
  for (let i = start; i < start + 3; i++) {
    const d = await deriveTronDepositAddress(i);
    console.log({ index: d.derivationIndex, path: d.path, address: d.address });
  }
}

main();
