import { isAddressEqual } from 'viem'

import { getMarketId } from '../utils/market'
import { CHAIN_IDS } from '../constants/chain'

import { Book } from './book'
import { Currency } from './currency'
import { Depth } from './depth'
import { FeePolicy } from './fee-policy'

export class Market {
  id: string
  quote: Currency
  base: Currency
  makerPolicy: FeePolicy
  hooks: `0x${string}`
  takerPolicy: FeePolicy
  latestTick: bigint
  latestPrice: bigint
  latestTimestamp: number
  bids: Depth[]
  asks: Depth[]
  books: Book[]

  constructor({
    chainId,
    tokens,
    makerPolicy,
    hooks,
    takerPolicy,
    latestTick,
    latestPrice,
    latestTimestamp,
    books,
  }: {
    chainId: CHAIN_IDS
    tokens: [Currency, Currency]
    makerPolicy: FeePolicy
    hooks: `0x${string}`
    takerPolicy: FeePolicy
    latestTick: bigint
    latestPrice: bigint
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
    this.latestTick = latestTick
    this.latestPrice = latestPrice
    this.latestTimestamp = latestTimestamp
    this.bids = books
      .filter((book) => isAddressEqual(book.quote.address, this.quote.address))
      .flatMap((book) => book.depths)
    this.asks = books
      .filter((book) => isAddressEqual(book.quote.address, this.base.address))
      .flatMap((book) => book.depths)
    this.books = books
  }

  // take function

  // spend function
}
