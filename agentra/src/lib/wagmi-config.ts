import { http, createConfig } from "wagmi";
import { mainnet, arbitrum, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

/** MetaMask, Trust (in-app browser), Phantom EVM, Keplr EVM via standard injected provider. */
export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});
