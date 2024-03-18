import { PriceBook } from './price-book'
import { CloberPrice } from './cloberPrice'

export class ArithmeticPriceBook implements PriceBook {
  public readonly a: bigint
  public readonly d: bigint
  constructor(a: bigint, d: bigint | null) {
    if (!d) {
      throw `ArithmeticPriceBook: 'd' is missing`
    }
    this.a = a
    this.d = d
    this.indexToPrice = this.indexToPrice.bind(this)
    this.priceToIndex = this.priceToIndex.bind(this)
  }

  public strategy: 'arithmetic' | 'geometric' = 'arithmetic'

  public indexToPrice(priceIndex: number): CloberPrice {
    return {
      index: priceIndex,
      value: this.a + this.d * BigInt(priceIndex),
    }
  }

  public priceToIndex(price: bigint, roundingUp: boolean): CloberPrice {
    let index = Number((price - this.a) / this.d)
    if (roundingUp && (price - this.a) % this.d > 0n) {
      index++
    }
    return { index, value: this.indexToPrice(index).value }
  }
}
