import { getAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Aggregator } from '../model/aggregator'
import { OdosAggregator } from '../model/aggregator/odos'

import { findSupportChain } from './chain'

export const AGGREGATORS: {
  [chain in CHAIN_IDS]: Aggregator[]
} = {
  [CHAIN_IDS.MITOSIS_TESTNET]: [],
  [CHAIN_IDS.BASE]: [
    new OdosAggregator(
      getAddress('0x19cEeAd7105607Cd444F5ad10dd51356436095a1'),
      findSupportChain(CHAIN_IDS.BASE.valueOf())!,
    ),
  ],
  [CHAIN_IDS.ZKSYNC]: [
    new OdosAggregator(
      getAddress('0x4bBa932E9792A2b917D47830C93a9BC79320E4f7'),
      findSupportChain(CHAIN_IDS.ZKSYNC.valueOf())!,
    ),
  ],
}
