import { zeroAddress } from 'viem'

import { CHAIN_IDS } from './chain'

export const CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]: {
    MarketRouter: `0x${string}`
    OrderCanceler: `0x${string}`
  }
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    MarketRouter: zeroAddress,
    OrderCanceler: zeroAddress,
  },
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    MarketRouter: zeroAddress,
    OrderCanceler: zeroAddress,
  },
}
