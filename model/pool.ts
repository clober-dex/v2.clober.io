import { StackedLineData } from '../components/chart/stacked/stacked-chart-model'

import { Currency } from './currency'

export type Pool = {
  key: `0x${string}`
  lpCurrency: Currency
  lpUsdValue: number
  currency0: Currency
  currency1: Currency
  apy: number
  tvl: number
  volume24h: number
  reserve0: number
  reserve1: number
  historicalPriceIndex: StackedLineData[]
}

export type PoolPosition = {
  pool: Pool
  amount: bigint
  value: number
}
