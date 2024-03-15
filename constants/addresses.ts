import { CHAIN_IDS } from './chain'

export const CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]: {
    MarketRouter: `0x${string}`
    OrderCanceler: `0x${string}`
  }
} = {
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    MarketRouter: '0xE457d3A17CD8528259fcdB3DcE43c6877f5c8F8a' as `0x${string}`,
    OrderCanceler:
      '0x592fd6f9C35229cc0c4c64e61f8f2D6517F6CC65' as `0x${string}`,
  },
}
