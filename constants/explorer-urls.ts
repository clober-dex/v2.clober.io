import { CHAIN_IDS } from '@clober/v2-sdk'

export const EXPLORER_URL: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: `https://sepolia.arbiscan.io`,
  [CHAIN_IDS.BERACHAIN_TESTNET]: 'https://bartio.beratrail.io',
  [CHAIN_IDS.BASE]: `https://basescan.org`,
  [CHAIN_IDS.ZKSYNC]: `https://explorer.zksync.io`,
}
