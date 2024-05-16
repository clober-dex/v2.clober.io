import { zeroAddress } from 'viem'

import { Aggregator } from '../model/aggregator'
import { OdosAggregator } from '../model/aggregator/odos'

import { CHAIN_IDS, findSupportChain } from './chain'

export const AGGREGATORS: {
  [chain in CHAIN_IDS]: Aggregator[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [],
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: [],
  [CHAIN_IDS.BASE]: [
    new OdosAggregator(
      zeroAddress,
      findSupportChain(CHAIN_IDS.BASE.valueOf())!,
    ),
  ],
  [CHAIN_IDS.ZKSYNC]: [
    new OdosAggregator(
      zeroAddress,
      findSupportChain(CHAIN_IDS.ZKSYNC.valueOf())!,
    ),
  ],
  [CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET]: [],
}
