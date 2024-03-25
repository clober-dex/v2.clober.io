import { baseToQuote, divide, quoteToBase, toPrice } from '../utils/tick'

import { Currency } from './currency'
import { Depth } from './depth'
import { FeePolicy } from './fee-policy'

export class Book {
  id: bigint
  base: Currency
  unit: bigint
  quote: Currency
  makerPolicy: FeePolicy
  hooks: `0x${string}`
  takerPolicy: FeePolicy
  latestTick: bigint
  latestPrice: bigint
  depths: Depth[]

  constructor({
    id,
    base,
    quote,
    unit,
    makerPolicy,
    hooks,
    takerPolicy,
    latestTick,
    latestPrice,
    depths,
  }: {
    id: bigint
    base: Currency
    quote: Currency
    unit: bigint
    makerPolicy: FeePolicy
    hooks: `0x${string}`
    takerPolicy: FeePolicy
    latestTick: bigint
    latestPrice: bigint
    depths: Depth[]
  }) {
    this.id = id
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
    amountOut, // quote
  }: {
    limitPrice: bigint
    amountOut: bigint
  }) => {
    let takenQuoteAmount = 0n
    let spendBaseAmount = 0n
    if (this.depths.length === 0) {
      return {
        takenQuoteAmount,
        spendBaseAmount,
      }
    }

    const ticks = this.depths
      .sort((a, b) => Number(b.price) - Number(a.price))
      .map((depth) => depth.tick)
    let index = 0
    let tick = ticks[index]
    while (tick > -8388608n) {
      if (limitPrice > toPrice(tick)) {
        break
      }
      let maxAmount = this.takerPolicy.usesQuote
        ? this.takerPolicy.calculateOriginalAmount(
            amountOut - takenQuoteAmount,
            true,
          )
        : amountOut - takenQuoteAmount
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
      if (this.takerPolicy.usesQuote) {
        quoteAmount =
          quoteAmount - this.takerPolicy.calculateFee(quoteAmount, false)
      } else {
        baseAmount =
          baseAmount + this.takerPolicy.calculateFee(baseAmount, false)
      }
      if (quoteAmount === 0n) {
        break
      }

      takenQuoteAmount += quoteAmount
      spendBaseAmount += baseAmount
      if (amountOut <= takenQuoteAmount) {
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

  spend = ({
    limitPrice,
    amountIn, // base
  }: {
    limitPrice: bigint
    amountIn: bigint
  }) => {
    let takenQuoteAmount = 0n
    let spendBaseAmount = 0n
    if (this.depths.length === 0) {
      return {
        takenQuoteAmount,
        spendBaseAmount,
      }
    }

    const ticks = this.depths
      .sort((a, b) => Number(b.price) - Number(a.price))
      .map((depth) => depth.tick)
    let index = 0
    let tick = ticks[index]
    while (spendBaseAmount <= amountIn && tick > -8388608n) {
      if (limitPrice > toPrice(tick)) {
        break
      }
      let maxAmount = this.takerPolicy.usesQuote
        ? amountIn - spendBaseAmount
        : this.takerPolicy.calculateOriginalAmount(
            amountIn - spendBaseAmount,
            false,
          )
      maxAmount = baseToQuote(tick, maxAmount, false) / this.unit

      if (maxAmount === 0n) {
        break
      }
      const currentDepth = this.depths.find((depth) => depth.tick === tick)!
      let quoteAmount =
        (currentDepth.rawAmount > maxAmount
          ? maxAmount
          : currentDepth.rawAmount) * this.unit
      let baseAmount = quoteToBase(tick, quoteAmount, true)
      if (this.takerPolicy.usesQuote) {
        quoteAmount =
          quoteAmount - this.takerPolicy.calculateFee(quoteAmount, false)
      } else {
        baseAmount =
          baseAmount + this.takerPolicy.calculateFee(baseAmount, false)
      }
      if (baseAmount === 0n) {
        break
      }

      takenQuoteAmount += quoteAmount
      spendBaseAmount += baseAmount
      index++
      tick = ticks[index]
    }
    return {
      takenQuoteAmount,
      spendBaseAmount,
    }
  }
}
