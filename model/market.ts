import { isAddressEqual } from 'viem'

import { Book } from './book'
import { Currency } from './currency'
import { Depth } from './depth'

export class Market {
  quote: Currency
  base: Currency
  latestPriceIndex: bigint
  latestPrice: bigint
  bids: Depth[]
  asks: Depth[]
  books: Book[]

  constructor({
    tokens,
    latestPriceIndex,
    latestPrice,
    books,
  }: {
    tokens: [Currency, Currency]
    latestPriceIndex: bigint
    latestPrice: bigint
    books: Book[]
  }) {
    if (tokens.length !== 2) {
      throw new Error('Invalid token pair')
    }
    const _tokens = tokens.sort((a, b) => a.address.localeCompare(b.address))
    this.quote = _tokens[0]
    this.base = _tokens[1]
    this.latestPriceIndex = latestPriceIndex
    this.latestPrice = latestPrice
    this.bids = books
      .filter((book) => isAddressEqual(book.quote.address, this.quote.address))
      .flatMap((book) => book.depths)
    this.asks = books
      .filter((book) => isAddressEqual(book.quote.address, this.base.address))
      .flatMap((book) => book.depths)
    this.books = books
  }
}
