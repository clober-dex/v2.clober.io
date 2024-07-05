import { Currency } from './currency'

export type Vault = {
  currency0: Currency
  currency1: Currency
  apy: number
  tvl: number
  volume24h: number
}
