import { CHAIN_IDS } from '@clober/v2-sdk'

export const EXPLORER_URL: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.MITOSIS_TESTNET]:
    'https://blockscout-internal.testnet.mitosis.org',
  [CHAIN_IDS.BASE]: `https://basescan.org`,
  [CHAIN_IDS.ZKSYNC]: `https://explorer.zksync.io`,
}
