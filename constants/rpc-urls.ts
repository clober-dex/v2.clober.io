import { CHAIN_IDS } from '@clober/v2-sdk'

const ALCHEMY_API_KEY = '3Um4IcT1mrq2MEOYurXvsRAzk_v3Q_4X'

export const RPC_URL: {
  [chain in CHAIN_IDS]: string
} = {
  [CHAIN_IDS.MITOSIS_TESTNET]: 'https://rpc.testnet.mitosis.org',
  // [CHAIN_IDS.BASE]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  // [CHAIN_IDS.ZKSYNC]: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  [CHAIN_IDS.BASE]: `https://base.blockpi.network/v1/rpc/110fe8714c65fa36e46cf73d6a911a4dcdc30586`,
  [CHAIN_IDS.ZKSYNC]: `https://zksync-era.blockpi.network/v1/rpc/2846164c9074ec11fcbb2bab7c254b64dd0ef09a`,
}
