import React from 'react'

import { Pool } from '../model/pool'
import { BERACHAIN_TESTNET_WHITELISTED_CURRENCIES } from '../constants/currencies/80085'

const pools: Pool[] = BERACHAIN_TESTNET_WHITELISTED_CURRENCIES.map(
  (currency) => {
    return {
      lpCurrency: currency,
      currency0: currency,
      currency1: currency,
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    }
  },
)

export const PoolManagerContainer = () => {
  return <div className="text-white">ASDF</div>
}
