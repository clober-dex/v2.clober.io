import { zeroAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Aggregator } from '../model/aggregator'
import { OdosAggregator } from '../model/aggregator/odos'
import { OogaBoogaAggregator } from '../model/aggregator/ooga-booga'

import { findSupportChain } from './chain'

export const AGGREGATORS: {
  [chain in CHAIN_IDS]: Aggregator[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [],
  [CHAIN_IDS.BERACHAIN_TESTNET]: [
    new OogaBoogaAggregator(
      zeroAddress,
      findSupportChain(CHAIN_IDS.BERACHAIN_TESTNET.valueOf())!,
    ),
  ],
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
}
