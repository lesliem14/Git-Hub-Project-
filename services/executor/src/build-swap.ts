/**
 * Live execution worker stub — builds unsigned swap calldata for user wallet signing.
 * Not wired to broadcast in MVP; returns payload for future wallet integration.
 */
import type { DexQuoteResult } from "../../../packages/dex-adapters/src/index";

export interface UnsignedSwapPayload {
  chainId: number;
  to: string;
  data: string;
  value: string;
  estimatedNetUsdt: number;
  venue: DexQuoteResult["venue"];
  disclaimer: string;
}

export function buildPaperSwapPayload(quote: DexQuoteResult, netUsdt: number): UnsignedSwapPayload {
  return {
    chainId: 1,
    to: "0x0000000000000000000000000000000000000000",
    data: "0x",
    value: "0",
    estimatedNetUsdt: netUsdt,
    venue: quote.venue,
    disclaimer: "MVP: live signing not enabled. Paper mode only.",
  };
}
