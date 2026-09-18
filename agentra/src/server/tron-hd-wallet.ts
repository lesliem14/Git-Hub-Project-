import * as bip39 from "bip39";
import BIP32Factory from "bip32";
import * as ecc from "@bitcoinerlab/secp256k1";
import { eq } from "drizzle-orm";
import { depositAddressPool, depositHdState, auditLogs } from "../../drizzle/schema";
import { getDb, isDatabaseConfigured } from "@/lib/db";

/** BIP44 coin type for Tron */
const TRON_COIN_TYPE = 195;

const bip32 = BIP32Factory(ecc);

export interface DerivedTronDeposit {
  address: string;
  derivationIndex: number;
  path: string;
}

function depositPath(index: number): string {
  return `m/44'/${TRON_COIN_TYPE}'/0'/0/${index}`;
}

export function isTronHdConfigured(): boolean {
  const mnemonic = process.env.TRON_DEPOSIT_MNEMONIC?.trim();
  return Boolean(mnemonic && bip39.validateMnemonic(mnemonic));
}

function getMnemonic(): string {
  const mnemonic = process.env.TRON_DEPOSIT_MNEMONIC?.trim();
  if (!mnemonic) {
    throw new Error("TRON_DEPOSIT_MNEMONIC is not set");
  }
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("TRON_DEPOSIT_MNEMONIC is invalid");
  }
  return mnemonic;
}

/**
 * Derive a Tron TRC-20 deposit address from the platform HD seed.
 * Private keys never leave this module — only the base58 address is returned.
 */
export async function deriveTronDepositAddress(index: number): Promise<DerivedTronDeposit> {
  const mnemonic = getMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const path = depositPath(index);
  const child = root.derivePath(path);

  if (!child.privateKey) {
    throw new Error(`Failed to derive private key at ${path}`);
  }

  const privateKeyHex = Buffer.from(child.privateKey).toString("hex");
  const mod = await import("tronweb");
  const TronWebCtor = mod.TronWeb ?? mod.default?.TronWeb ?? mod.default;
  const address = TronWebCtor.address.fromPrivateKey(privateKeyHex) as string;

  if (!address || !address.startsWith("T")) {
    throw new Error("Invalid Tron address derived");
  }

  return { address, derivationIndex: index, path };
}

/** Reserve the next HD index and persist the address in the pool (unassigned). */
export async function mintNextPoolDepositAddress(): Promise<DerivedTronDeposit | null> {
  if (!isDatabaseConfigured() || !isTronHdConfigured()) return null;

  const db = getDb();
  const startOffset = Number(process.env.TRON_DEPOSIT_INDEX_START ?? "0");

  return db.transaction(async (tx) => {
    let state = await tx.query.depositHdState.findFirst({
      where: eq(depositHdState.id, "1"),
    });
    if (!state) {
      await tx.insert(depositHdState).values({ id: "1", nextDerivationIndex: String(startOffset) });
      state = { id: "1", nextDerivationIndex: String(startOffset), updatedAt: new Date() };
    }

    let index = Number(state.nextDerivationIndex);
    let derived: DerivedTronDeposit | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = await deriveTronDepositAddress(index);
      const exists = await tx.query.depositAddressPool.findFirst({
        where: eq(depositAddressPool.address, candidate.address),
      });
      if (!exists) {
        derived = candidate;
        break;
      }
      index += 1;
    }

    if (!derived) {
      throw new Error("Could not mint unique deposit address");
    }

    await tx.insert(depositAddressPool).values({
      address: derived.address,
      derivationIndex: String(derived.derivationIndex),
    });

    await tx
      .update(depositHdState)
      .set({
        nextDerivationIndex: String(derived.derivationIndex + 1),
        updatedAt: new Date(),
      })
      .where(eq(depositHdState.id, "1"));

    await tx.insert(auditLogs).values({
      action: "deposit_address_minted",
      metadata: {
        address: derived.address,
        derivationIndex: derived.derivationIndex,
        path: derived.path,
      },
    });

    return derived;
  });
}

/** Re-derive signing key for treasury sweep (server-only, never expose to clients). */
export async function deriveTronPrivateKeyForIndex(index: number): Promise<string> {
  const mnemonic = getMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath(depositPath(index));
  if (!child.privateKey) throw new Error("Derive failed");
  return Buffer.from(child.privateKey).toString("hex");
}
