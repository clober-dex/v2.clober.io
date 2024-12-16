import { CHAIN_IDS } from '@clober/v2-sdk'

import { Prices } from '../model/prices'

export const TESTNET_PRICES: {
  [chain in CHAIN_IDS]: Prices
} = {
  [CHAIN_IDS.MITOSIS_TESTNET]: {} as Prices,
}
