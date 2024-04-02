import { isAddressEqual } from 'viem'

import { getMarketId } from '../utils/market'
import { CHAIN_IDS } from '../constants/chain'
import {
  baseToQuote,
  divide,
  fromPrice,
  invertPrice,
  quoteToBase,
  toPrice,
} from '../utils/tick'
import { formatPrice } from '../utils/prices'

import { Book } from './book'
import { Currency } from './currency'
import { Depth, MarketDepth } from './depth'
import { FeePolicy } from './fee-policy'

export class Market {
  id: string
  quote: Currency
  base: Currency
  makerPolicy: FeePolicy
  hooks: `0x${string}`
  takerPolicy: FeePolicy
  latestPrice: number
  latestTimestamp: number
  bids: MarketDepth[]
  asks: MarketDepth[]
  books: Book[]

  constructor({
    chainId,
    tokens,
    makerPolicy,
    hooks,
    takerPolicy,
    latestPrice,
    latestTimestamp,
    books,
  }: {
    chainId: CHAIN_IDS
    tokens: [Currency, Currency]
    makerPolicy: FeePolicy
    hooks: `0x${string}`
    takerPolicy: FeePolicy
    latestPrice: number
    latestTimestamp: number
    books: Book[]
  }) {
    const { marketId, quote, base } = getMarketId(
      chainId,
      tokens.map((token) => token.address),
    )
    this.id = marketId
    this.quote = tokens.find((token) => isAddressEqual(token.address, quote))!
    this.base = tokens.find((token) => isAddressEqual(token.address, base))!
    this.makerPolicy = makerPolicy
    this.hooks = hooks
    this.takerPolicy = takerPolicy
    this.latestPrice = latestPrice
    this.latestTimestamp = latestTimestamp
    this.bids = books
      .filter((book) => isAddressEqual(book.quote.address, this.quote.address))
      .flatMap((book) => book.depths)
      .map(
        (depth) =>
          ({
            tick: depth.tick,
            price: formatPrice(
              toPrice(depth.tick),
              this.quote.decimals,
              this.base.decimals,
            ),
            baseAmount: quoteToBase(
              depth.tick,
              depth.rawAmount * depth.unit,
              false,
            ),
          }) as MarketDepth,
      )
    this.asks = books
      .filter((book) => isAddressEqual(book.quote.address, this.base.address))
      .flatMap((book) => book.depths)
      .map((depth) => {
        const price = invertPrice(toPrice(depth.tick))
        const tick = fromPrice(price)
        const readablePrice = formatPrice(
          price,
          this.quote.decimals,
          this.base.decimals,
        )
        const baseAmount = depth.rawAmount * depth.unit
        return {
          tick,
          price: readablePrice,
          baseAmount,
        } as MarketDepth
      })
    this.books = books
  }

  take = ({
    takeQuote,
    limitPrice,
    amountOut, // quote if takeQuote, base otherwise
  }: {
    takeQuote: boolean
    limitPrice: bigint
    amountOut: bigint
  }) => {
    if (takeQuote) {
      const bidDepths = this.books
        .filter((book) =>
          isAddressEqual(book.quote.address, this.quote.address),
        )
        .flatMap((book) => book.depths)
      return this.takeInner({
        depths: bidDepths,
        limitPrice: invertPrice(limitPrice),
        amountOut,
      })
    } else {
      const askDepths = this.books
        .filter((book) => isAddressEqual(book.quote.address, this.base.address))
        .flatMap((book) => book.depths)
      return this.takeInner({
        depths: askDepths,
        limitPrice,
        amountOut,
      })
    }
  }

  spend = ({
    spendBase,
    limitPrice,
    amountIn, // base if spendBase, quote otherwise
  }: {
    spendBase: boolean
    limitPrice: bigint
    amountIn: bigint
  }) => {
    if (spendBase) {
      const bidDepths = this.books
        .filter((book) =>
          isAddressEqual(book.quote.address, this.quote.address),
        )
        .flatMap((book) => book.depths)
      return this.spendInner({
        depths: bidDepths,
        limitPrice: invertPrice(limitPrice),
        amountIn,
      })
    } else {
      const askDepths = this.books
        .filter((book) => isAddressEqual(book.quote.address, this.base.address))
        .flatMap((book) => book.depths)
      return this.spendInner({
        depths: askDepths,
        limitPrice,
        amountIn,
      })
    }
  }

  takeInner = ({
    depths, // only bid orders
    limitPrice,
    amountOut, // quote
  }: {
    depths: Depth[]
    limitPrice: bigint
    amountOut: bigint
  }) => {
    if (depths.length === 0) {
      return {}
    }
    const takeResult: {
      [key in string]: {
        takenAmount: bigint
        spendAmount: bigint
      }
    } = {}
    for (const depth of depths) {
      if (!takeResult[depth.bookId]) {
        takeResult[depth.bookId] = {
          takenAmount: 0n,
          spendAmount: 0n,
        }
      }
    }
    let totalTakenQuoteAmount = 0n

    const ticks = depths
      .sort((a, b) => Number(b.tick) - Number(a.tick))
      .map((depth) => depth.tick)
    let index = 0
    let tick = ticks[index]
    while (tick > -8388608n) {
      if (limitPrice > toPrice(tick)) {
        break
      }
      const currentDepth = depths.find((depth) => depth.tick === tick)!
      const currentBook = this.books.find(
        (book) => book.id === BigInt(currentDepth.bookId),
      )!
      let maxAmount = this.takerPolicy.usesQuote
        ? this.takerPolicy.calculateOriginalAmount(
            amountOut - totalTakenQuoteAmount,
            true,
          )
        : amountOut - totalTakenQuoteAmount
      maxAmount = divide(maxAmount, currentBook.unit, true)

      if (maxAmount === 0n) {
        break
      }
      let quoteAmount =
        (currentDepth.rawAmount > maxAmount
          ? maxAmount
          : currentDepth.rawAmount) * currentBook.unit
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

      takeResult[currentDepth.bookId].takenAmount += quoteAmount
      takeResult[currentDepth.bookId].spendAmount += baseAmount
      totalTakenQuoteAmount += quoteAmount
      if (amountOut <= totalTakenQuoteAmount) {
        break
      }
      if (ticks.length === index + 1) {
        break
      }
      index++
      tick = ticks[index]
    }
    return Object.fromEntries(
      Object.entries(takeResult).filter(
        ([, value]) => value.spendAmount > 0 && value.takenAmount > 0,
      ),
    )
  }

  spendInner = ({
    depths, // only bid orders
    limitPrice,
    amountIn, // base
  }: {
    depths: Depth[]
    limitPrice: bigint
    amountIn: bigint
  }) => {
    if (depths.length === 0) {
      return {}
    }
    const spendResult: {
      [key in string]: {
        takenAmount: bigint
        spendAmount: bigint
      }
    } = {}
    for (const depth of depths) {
      if (!spendResult[depth.bookId]) {
        spendResult[depth.bookId] = {
          takenAmount: 0n,
          spendAmount: 0n,
        }
      }
    }
    let totalSpendBaseAmount = 0n

    const ticks = depths
      .sort((a, b) => Number(b.tick) - Number(a.tick))
      .map((depth) => depth.tick)
    let index = 0
    let tick = ticks[index]
    while (totalSpendBaseAmount <= amountIn && tick > -8388608n) {
      if (limitPrice > toPrice(tick)) {
        break
      }
      const currentDepth = depths.find((depth) => depth.tick === tick)!
      const currentBook = this.books.find(
        (book) => book.id === BigInt(currentDepth.bookId),
      )!
      let maxAmount = this.takerPolicy.usesQuote
        ? amountIn - totalSpendBaseAmount
        : this.takerPolicy.calculateOriginalAmount(
            amountIn - totalSpendBaseAmount,
            false,
          )
      maxAmount = baseToQuote(tick, maxAmount, false) / currentBook.unit

      if (maxAmount === 0n) {
        break
      }
      let quoteAmount =
        (currentDepth.rawAmount > maxAmount
          ? maxAmount
          : currentDepth.rawAmount) * currentBook.unit
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

      spendResult[currentDepth.bookId].takenAmount += quoteAmount
      spendResult[currentDepth.bookId].spendAmount += baseAmount
      totalSpendBaseAmount += baseAmount
      if (ticks.length === index + 1) {
        break
      }
      index++
      tick = ticks[index]
    }
    return Object.fromEntries(
      Object.entries(spendResult).filter(
        ([, value]) => value.spendAmount > 0 && value.takenAmount > 0,
      ),
    )
  }
}
