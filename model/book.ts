import { divide, quoteToBase, toPrice } from '../utils/tick'
import {
  calculateFee,
  calculateOriginalAmount,
  getUsesQuote,
} from '../utils/fee'

import { Currency } from './currency'
import { Depth } from './depth'

export class Book {
  base: Currency
  unit: bigint
  quote: Currency
  makerPolicy: bigint
  hooks: `0x${string}`
  takerPolicy: bigint
  latestTick: bigint
  latestPrice: bigint
  depths: Depth[]

  constructor({
    base,
    unit,
    quote,
    makerPolicy,
    hooks,
    takerPolicy,
    latestTick,
    latestPrice,
    depths,
  }: {
    base: Currency
    unit: bigint
    quote: Currency
    makerPolicy: bigint
    hooks: `0x${string}`
    takerPolicy: bigint
    latestTick: bigint
    latestPrice: bigint
    depths: Depth[]
  }) {
    this.base = base
    this.unit = unit
    this.quote = quote
    this.makerPolicy = makerPolicy
    this.hooks = hooks
    this.takerPolicy = takerPolicy
    this.latestTick = latestTick
    this.latestPrice = latestPrice
    this.depths = depths
  }

  take = ({
    limitPrice,
    amountIn, // quote
  }: {
    limitPrice: bigint
    amountIn: bigint
  }) => {
    let takenQuoteAmount = 0n
    let spendBaseAmount = 0n

    const ticks = this.depths
      .sort((a, b) => Number(b.price) - Number(a.price))
      .map((depth) => depth.tick)
    let index = 0
    let tick = ticks[index]
    while (tick > -8388608n) {
      if (limitPrice > toPrice(tick)) {
        break
      }
      let maxAmount = getUsesQuote(this.takerPolicy)
        ? calculateOriginalAmount(
            this.takerPolicy,
            amountIn - takenQuoteAmount,
            true,
          )
        : amountIn - takenQuoteAmount
      maxAmount = divide(maxAmount, this.unit, true)

      if (maxAmount === 0n) {
        break
      }
      const currentDepth = this.depths.find((depth) => depth.tick === tick)!
      let quoteAmount =
        (currentDepth.rawAmount > maxAmount
          ? maxAmount
          : currentDepth.rawAmount) * this.unit
      let baseAmount = quoteToBase(tick, quoteAmount, true)
      if (getUsesQuote(this.takerPolicy)) {
        quoteAmount =
          quoteAmount - calculateFee(this.takerPolicy, quoteAmount, false)
      } else {
        baseAmount =
          baseAmount + calculateFee(this.takerPolicy, baseAmount, false)
      }
      if (quoteAmount === 0n) {
        break
      }

      takenQuoteAmount += quoteAmount
      spendBaseAmount += baseAmount
      if (amountIn <= takenQuoteAmount) {
        break
      }
      index++
      tick = ticks[index]
    }
    return {
      takenQuoteAmount,
      spendBaseAmount,
    }
  }

  // spend function
}
