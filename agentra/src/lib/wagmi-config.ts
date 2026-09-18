import { http, createConfig } from "wagmi";
import { mainnet, arbitrum, base, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";

/** MetaMask, Trust (in-app browser), Phantom EVM, Keplr EVM via standard injected provider. */
export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, arbitrum, base],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

export const DEFAULT_LIVE_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_AGENTRA_LIVE_CHAIN_ID ?? "11155111",
  10,
);
