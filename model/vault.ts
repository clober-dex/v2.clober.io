import { Currency } from './currency'

export type Vault = {
  lp: Currency
  currency0: Currency
  currency1: Currency
  apy: number
  tvl: number
  volume24h: number
}

export type OpenVault = {
  vault: Vault
  lpAmount: bigint
  lpValue: number
}
