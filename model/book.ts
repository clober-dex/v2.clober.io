import { Currency } from './currency'
import { Depth } from './depth'

export class Book {
  base: Currency
  unit: bigint
  quote: Currency
  makerPolicy: bigint
  hooks: `0x${string}`
  takerPolicy: bigint
  latestPriceIndex: bigint
  latestPrice: bigint
  depths: Depth[]

  constructor({
    base,
    unit,
    quote,
    makerPolicy,
    hooks,
    takerPolicy,
    latestPriceIndex,
    latestPrice,
    depths,
  }: {
    base: Currency
    unit: bigint
    quote: Currency
    makerPolicy: bigint
    hooks: `0x${string}`
    takerPolicy: bigint
    latestPriceIndex: bigint
    latestPrice: bigint
    depths: Depth[]
  }) {
    this.base = base
    this.unit = unit
    this.quote = quote
    this.makerPolicy = makerPolicy
    this.hooks = hooks
    this.takerPolicy = takerPolicy
    this.latestPriceIndex = latestPriceIndex
    this.latestPrice = latestPrice
    this.depths = depths
  }
}
