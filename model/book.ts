import { isAddressEqual } from 'viem'

import { baseToQuote, divide, quoteToBase, toPrice } from '../utils/tick'
import { getMarketId } from '../utils/market'
import { CHAIN_IDS } from '../constants/chain'

import { Currency } from './currency'
import { Depth } from './depth'
import { FeePolicy } from './fee-policy'

export class Book {
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
    chainId,
    tokens,
    unit,
    makerPolicy,
    hooks,
    takerPolicy,
    latestTick,
    latestPrice,
    depths,
  }: {
    chainId: CHAIN_IDS
    tokens: [Currency, Currency]
    unit: bigint
    makerPolicy: FeePolicy
    hooks: `0x${string}`
    takerPolicy: FeePolicy
    latestTick: bigint
    latestPrice: bigint
    depths: Depth[]
  }) {
    const { quote, base } = getMarketId(
      chainId,
      tokens.map((token) => token.address),
    )

    this.base = tokens.find((token) => isAddressEqual(token.address, base))!
    this.unit = unit
    this.quote = tokens.find((token) => isAddressEqual(token.address, quote))!
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
