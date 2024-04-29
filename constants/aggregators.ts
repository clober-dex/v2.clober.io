import { Aggregator } from '../model/aggregator'

import { CHAIN_IDS } from './chain'

export const AGGREGATORS: {
  [chain in CHAIN_IDS]: Aggregator[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [],
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: [],
  [CHAIN_IDS.BASE]: [],
}
