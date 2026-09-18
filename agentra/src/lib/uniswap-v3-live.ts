import { encodeFunctionData, parseUnits, toHex } from "viem";

export interface ChainSwapConfig {
  swapRouter: `0x${string}`;
  weth: `0x${string}`;
  usdc: `0x${string}`;
  defaultPoolFee: number;
}

export const SWAP_CONFIG: Record<number, ChainSwapConfig> = {
  1: {
    swapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    defaultPoolFee: 500,
  },
  11155111: {
    swapRouter: "0x3bFA4769CB21bCE3e7703442Af134bBb89A351A2",
    weth: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    usdc: "0x1c7D4B196Cb0C7B19d74D2fcd6788aa52367c604",
    defaultPoolFee: 3000,
  },
};

const swapRouterAbi = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const wethAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
] as const;

export interface LiveSwapTx {
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  value: `0x${string}`;
  gas?: string;
  label: string;
}

export type SwapStyle = "wrap" | "uniswap";

export function getChainSwapConfig(chainId: number): ChainSwapConfig | null {
  const overrideRouter = process.env.AGENTRA_SWAP_ROUTER as `0x${string}` | undefined;
  const base = SWAP_CONFIG[chainId];
  if (!base) return null;
  if (overrideRouter) return { ...base, swapRouter: overrideRouter };
  return base;
}

function clampAmountInUsdt(maxTradeUsdt: number): number {
  const cap = parseFloat(process.env.AGENTRA_LIVE_MAX_ETH_SWAP ?? "0.002");
  const ethFromUsdt = maxTradeUsdt / 3500;
  return Math.min(Math.max(ethFromUsdt, 0.0001), cap);
}

export function buildWrapEthTransaction(input: {
  chainId: number;
  recipient: `0x${string}`;
  maxTradeUsdt: number;
}): LiveSwapTx | null {
  const cfg = getChainSwapConfig(input.chainId);
  if (!cfg) return null;
  const ethAmount = clampAmountInUsdt(input.maxTradeUsdt);
  const wei = parseUnits(ethAmount.toFixed(6), 18);
  const data = encodeFunctionData({ abi: wethAbi, functionName: "deposit", args: [] });
  return {
    chainId: input.chainId,
    to: cfg.weth,
    data,
    value: toHex(wei),
    gas: "80000",
    label: "wrap_eth",
  };
}

export function buildUniswapExactInputSingle(input: {
  chainId: number;
  recipient: `0x${string}`;
  maxTradeUsdt: number;
  slippageBps?: number;
}): { approve: LiveSwapTx; swap: LiveSwapTx } | null {
  const cfg = getChainSwapConfig(input.chainId);
  if (!cfg) return null;

  const usdcAmount = Math.min(Math.max(input.maxTradeUsdt, 1), 50);
  const amountIn = parseUnits(usdcAmount.toFixed(2), 6);
  const slippage = input.slippageBps ?? 500;
  const amountOutMinimum = parseUnits(
    ((usdcAmount / 3500) * (1 - slippage / 10_000)).toFixed(8),
    18,
  );
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [cfg.swapRouter, amountIn],
  });

  const swapData = encodeFunctionData({
    abi: swapRouterAbi,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: cfg.usdc,
        tokenOut: cfg.weth,
        fee: cfg.defaultPoolFee,
        recipient: input.recipient,
        deadline,
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });

  return {
    approve: {
      chainId: input.chainId,
      to: cfg.usdc,
      data: approveData,
      value: "0x0",
      gas: "70000",
      label: "approve_usdc",
    },
    swap: {
      chainId: input.chainId,
      to: cfg.swapRouter,
      data: swapData,
      value: "0x0",
      gas: "280000",
      label: "uniswap_exact_input_single",
    },
  };
}

export function buildLiveSwapBundle(input: {
  chainId: number;
  recipient: `0x${string}`;
  maxTradeUsdt: number;
  style: SwapStyle;
}): LiveSwapTx[] {
  if (input.style === "wrap") {
    const wrap = buildWrapEthTransaction(input);
    return wrap ? [wrap] : [];
  }
  const pair = buildUniswapExactInputSingle(input);
  return pair ? [pair.approve, pair.swap] : [];
}
