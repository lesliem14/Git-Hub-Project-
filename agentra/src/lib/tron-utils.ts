export function isValidTrc20Address(address: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
}

export function getAgentraTreasuryAddress(): string {
  const addr = process.env.AGENTRA_TREASURY_TRC20?.trim();
  if (!addr) {
    throw new Error("AGENTRA_TREASURY_TRC20 is not configured");
  }
  if (!isValidTrc20Address(addr)) {
    throw new Error("AGENTRA_TREASURY_TRC20 is invalid");
  }
  return addr;
}
