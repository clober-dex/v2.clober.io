import { Currency } from './currency'

export type Pool = {
  lpCurrency: Currency
  currency0: Currency
  currency1: Currency
  apy: number
  tvl: number
  volume24h: number
}

export type PoolPosition = {
  pool: Pool
  amount: bigint
  value: number
}
