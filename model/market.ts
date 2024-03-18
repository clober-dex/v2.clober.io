import { isAddressEqual } from 'viem'

import { getMarketId } from '../utils/market'
import { CHAIN_IDS } from '../constants/chain'

import { Book } from './book'
import { Currency } from './currency'
import { Depth } from './depth'

export class Market {
  id: string
  quote: Currency
  base: Currency
  latestTick: bigint
  latestPrice: bigint
  bids: Depth[]
  asks: Depth[]
  books: Book[]

  constructor({
    chainId,
    tokens,
    latestPriceIndex,
    latestPrice,
    books,
  }: {
    chainId: CHAIN_IDS
    tokens: [Currency, Currency]
    latestPriceIndex: bigint
    latestPrice: bigint
    books: Book[]
  }) {
    const { marketId, quote, base } = getMarketId(
      chainId,
      tokens.map((token) => token.address),
    )
    this.id = marketId
    this.quote = tokens.find((token) => isAddressEqual(token.address, quote))!
    this.base = tokens.find((token) => isAddressEqual(token.address, base))!
    this.latestTick = latestPriceIndex
    this.latestPrice = latestPrice
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
