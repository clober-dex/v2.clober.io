import { CHAIN_IDS } from '@clober/v2-sdk'

import { Prices } from '../model/prices'

export const TESTNET_PRICES: {
  [chain in CHAIN_IDS]: Prices
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0': 1,
    '0x0000000000000000000000000000000000000000': 2500,
    '0xF2e615A933825De4B39b497f6e6991418Fb31b78': 2500,
  } as Prices,
  [CHAIN_IDS.BERACHAIN_TESTNET]: {} as Prices,
}
