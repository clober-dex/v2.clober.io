import { CHAIN_IDS } from '@clober/v2-sdk'

const ALCHEMY_API_KEY = '3Um4IcT1mrq2MEOYurXvsRAzk_v3Q_4X'

export const RPC_URL: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [CHAIN_IDS.BERACHAIN_TESTNET]: 'https://bartio.rpc.berachain.com',
  [CHAIN_IDS.BASE]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [CHAIN_IDS.ZKSYNC]: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
}
