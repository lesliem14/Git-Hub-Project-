# Live wallet signing (Agentra)

## Model

- **Non-custodial:** Agentra never stores private keys.
- **Link:** User signs an EIP-191 message to bind `0x…` to their account.
- **Execute:** Server prepares an unsigned tx → user signs in MetaMask/Trust/Phantom (EVM) → client posts tx hash → server verifies receipt on RPC and updates ledger.

## Default network

| Env | Default |
|-----|---------|
| `AGENTRA_LIVE_CHAIN_ID` | `11155111` (Sepolia) |
| `AGENTRA_LIVE_TX_MODE` | `probe` (attestation) or `swap` (Uniswap calldata) |
| `AGENTRA_LIVE_SWAP_STYLE` | `wrap` (ETH→WETH) or `uniswap` (USDC approve + exactInputSingle) |
| `AGENTRA_SWAP_ROUTER` | Optional override for SwapRouter02 address |

### Swap mode

- **Sepolia default style `wrap`:** one tx to WETH9 `deposit()` with small ETH value (`AGENTRA_LIVE_MAX_ETH_SWAP`, default 0.002 ETH).
- **Style `uniswap`:** two txs — ERC-20 `approve` on USDC, then SwapRouter02 `exactInputSingle` (USDC→WETH). Requires USDC balance on the wallet.
- **Allowlist:** confirm rejects txs whose `to` is not router/WETH/USDC for the configured chain.

`probe` mode remains available for pipeline testing without DEX interaction.

## User flow

1. License active (`mock_license_100` or deposit).
2. Connect EVM wallet → **Switch to live testnet** → **Link wallet for live signing**.
3. Bot → **Live** → **Start**.
4. **Prepare live opportunity** → **Sign & send** in wallet.
5. Dashboard shows on-chain `txHash` in executions.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/v1/account/evm-wallet` | Link address (challenge + signature) |
| POST | `/api/v1/bot/tick` | Live: `{ fromAddress }` → unsigned tx |
| POST | `/api/v1/executions/confirm` | `{ opportunityId, txHash, fromAddress }` |

## Gas

User pays network gas on the chosen chain. Keep Sepolia ETH for testing.
