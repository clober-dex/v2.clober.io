import { Book } from './book'
import { Currency } from './currency'

export class Market {
  token0: Currency
  token1: Currency
  latestPriceIndex: bigint
  latestPrice: bigint
  books: Book[]

  constructor({
    token0,
    token1,
    latestPriceIndex,
    latestPrice,
    books,
  }: {
    token0: Currency
    token1: Currency
    latestPriceIndex: bigint
    latestPrice: bigint
    books: Book[]
  }) {
    this.token0 = token0
    this.token1 = token1
    this.latestPriceIndex = latestPriceIndex
    this.latestPrice = latestPrice
    this.books = books
  }
}
