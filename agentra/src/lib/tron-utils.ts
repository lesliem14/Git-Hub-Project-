export function isValidTrc20Address(address: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
}

export function getAgentraTreasuryAddress(): string {
  const addr = process.env.AGENTRA_TREASURY_TRC20?.trim();
  if (!addr) {
    throw new Error("AGENTRA_TREASURY_TRC20 is not configured");
  }
  if (!isValidTrc20Address(addr)) {
    if (process.env.AGENTRA_MOCK_TRON === "true") {
      console.warn("[agentra] AGENTRA_TREASURY_TRC20 failed validation; using as mock treasury");
      return addr;
    }
    throw new Error("AGENTRA_TREASURY_TRC20 is invalid");
  }
  return addr;
}
