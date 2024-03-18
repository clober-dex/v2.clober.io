import { getAddress, isAddressEqual } from 'viem'

import { MarketDto } from '../apis/market'

import { Currency } from './currency'
import { ArithmeticPriceBook } from './price-book/arithmetic-price-book'
import { GeometricPriceBook } from './price-book/geometric-price-book'
import { PriceBook } from './price-book/price-book'
import { CloberPrice } from './price-book/cloberPrice'

type Depth = {
  price: bigint
  priceIndex: bigint
  rawAmount: bigint
  baseAmount: bigint
  isBid: boolean
}

export class MarketV1 {
  readonly FEE_PRECISION = 1000000n
  readonly PRICE_PRECISION = 1000000000000000000n

  address: `0x${string}`
  orderToken: `0x${string}`
  takerFee: bigint
  quoteUnit: bigint
  a: bigint
  d: bigint
  r: bigint
  latestPriceIndex: bigint
  latestPrice: bigint
  maxPriceIndex: bigint
  priceUpperBound: bigint
  quoteToken: Currency
  baseToken: Currency
  quotePrecisionComplement: bigint
  basePrecisionComplement: bigint
  bids: Depth[]
  asks: Depth[]

  priceBook: PriceBook

  constructor(
    address: `0x${string}`,
    orderToken: `0x${string}`,
    takerFee: bigint,
    quoteUnit: bigint,
    a: bigint,
    d: bigint,
    r: bigint,
    latestPriceIndex: bigint,
    latestPrice: bigint,
    maxPriceIndex: bigint,
    priceUpperBound: bigint,
    quoteToken: Currency,
    baseToken: Currency,
    quotePrecisionComplement: bigint,
    basePrecisionComplement: bigint,
    bids: Depth[],
    asks: Depth[],
  ) {
    this.address = address
    this.orderToken = orderToken
    this.takerFee = takerFee
    this.quoteUnit = quoteUnit
    this.a = a
    this.d = d
    this.r = r
    this.latestPriceIndex = latestPriceIndex
    this.latestPrice = latestPrice
    this.maxPriceIndex = maxPriceIndex
    this.priceUpperBound = priceUpperBound
    this.quoteToken = quoteToken
    this.baseToken = baseToken
    this.quotePrecisionComplement = quotePrecisionComplement
    this.basePrecisionComplement = basePrecisionComplement
    this.bids = bids
    this.asks = asks
    this.priceBook =
      r === 0n ? new ArithmeticPriceBook(a, d) : new GeometricPriceBook(a, r)
  }

  indexToPrice(priceIndex: number): CloberPrice {
    return this.priceBook.indexToPrice(priceIndex)
  }

  priceToIndex(price: bigint, roundingUp: boolean): CloberPrice {
    return this.priceBook.priceToIndex(price, roundingUp)
  }

  static from(market: MarketV1, bids: Depth[], asks: Depth[]): MarketV1 {
    return new MarketV1(
      market.address,
      market.orderToken,
      market.takerFee,
      market.quoteUnit,
      market.a,
      market.d,
      market.r,
      market.latestPriceIndex,
      market.latestPrice,
      market.maxPriceIndex,
      market.priceUpperBound,
      market.quoteToken,
      market.baseToken,
      market.quotePrecisionComplement,
      market.basePrecisionComplement,
      bids,
      asks,
    )
  }

  static fromDto(dto: MarketDto): MarketV1 {
    return new MarketV1(
      getAddress(dto.address),
      getAddress(dto.orderToken),
      BigInt(dto.takerFee),
      BigInt(dto.quoteUnit),
      BigInt(dto.a),
      BigInt(dto.d),
      BigInt(dto.r),
      BigInt(dto.latestPriceIndex),
      BigInt(dto.latestPrice),
      BigInt(dto.maxPriceIndex),
      BigInt(dto.priceUpperBound),
      dto.quoteToken,
      dto.baseToken,
      10n ** (18n - BigInt(dto.quoteToken.decimals)),
      10n ** (18n - BigInt(dto.baseToken.decimals)),
      dto.depths
        .filter((depth) => depth.isBid)
        .sort((a, b) => {
          return Number(b.price) - Number(a.price)
        })
        .map((depth) => ({
          price: BigInt(depth.price),
          priceIndex: BigInt(depth.priceIndex),
          rawAmount: BigInt(depth.rawAmount),
          baseAmount: BigInt(depth.baseAmount),
          isBid: depth.isBid,
        })),
      dto.depths
        .filter((depth) => !depth.isBid)
        .sort((a, b) => {
          return Number(a.price) - Number(b.price)
        })
        .map((depth) => ({
          price: BigInt(depth.price),
          priceIndex: BigInt(depth.priceIndex),
          rawAmount: BigInt(depth.rawAmount),
          baseAmount: BigInt(depth.baseAmount),
          isBid: depth.isBid,
        })),
    )
  }

  private divide(x: bigint, y: bigint, roundUp: boolean): bigint {
    if (roundUp) {
      if (x === 0n) {
        return 0n
      } else {
        return (x - 1n) / y + 1n
      }
    } else {
      return x / y
    }
  }

  quoteToRaw(amount: bigint, roundUp: boolean): bigint {
    return this.divide(amount, this.quoteUnit, roundUp)
  }

  rawToQuote(rawAmount: bigint): bigint {
    return rawAmount * this.quoteUnit
  }

  baseToRaw(amount: bigint, price: bigint, roundUp: boolean): bigint {
    return this.divide(
      amount * price * this.basePrecisionComplement,
      this.PRICE_PRECISION * this.quotePrecisionComplement * this.quoteUnit,
      roundUp,
    )
  }

  rawToBase(rawAmount: bigint, price: bigint, roundUp: boolean): bigint {
    return this.divide(
      this.rawToQuote(rawAmount) *
        this.PRICE_PRECISION *
        this.quotePrecisionComplement,
      price * this.basePrecisionComplement,
      roundUp,
    )
  }

  private calculateTakerFeeAmount(
    takeAmount: bigint,
    roundUp: boolean,
  ): bigint {
    return this.divide(takeAmount * this.takerFee, this.FEE_PRECISION, roundUp)
  }

  private calculateTakeAmountBeforeFees(amountAfterFees: bigint): bigint {
    return this.divide(
      amountAfterFees * this.FEE_PRECISION,
      this.FEE_PRECISION - this.takerFee,
      true,
    )
  }

  clone(): MarketV1 {
    return Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    )
  }

  spend(
    tokenIn: `0x${string}`,
    amountIn: bigint,
  ): {
    market: MarketV1
    amountOut: bigint
  } {
    const asks = [...this.asks.map((depth) => ({ ...depth }))]
    const bids = [...this.bids.map((depth) => ({ ...depth }))]
    let amountOut: bigint = 0n
    if (isAddressEqual(tokenIn, this.quoteToken.address as `0x${string}`)) {
      while (asks.length > 0) {
        const { price, rawAmount } = asks[0]
        const amountInRaw = this.quoteToRaw(amountIn, false)
        if (amountInRaw >= rawAmount) {
          amountIn -= this.rawToQuote(rawAmount)
          amountOut += this.rawToBase(rawAmount, price, false)
          asks.shift()
        } else {
          amountOut += this.rawToBase(amountInRaw, price, false)
          asks[0].rawAmount = rawAmount - amountInRaw
          break
        }
      }
    } else {
      while (bids.length > 0) {
        const { price, rawAmount } = bids[0]
        const amountInRaw = this.baseToRaw(amountIn, price, false)
        if (amountInRaw >= rawAmount) {
          amountIn -= this.rawToBase(rawAmount, price, true)
          amountOut += this.rawToQuote(rawAmount)
          bids.shift()
        } else {
          amountOut += this.rawToQuote(amountInRaw)
          bids[0].rawAmount = rawAmount - amountInRaw
          break
        }
      }
    }
    amountOut -= this.calculateTakerFeeAmount(amountOut, true)
    return {
      amountOut,
      market: MarketV1.from(this, bids, asks),
    }
  }

  take(
    tokenIn: string,
    amountOut: bigint,
  ): {
    market: MarketV1
    amountIn: bigint
  } {
    amountOut = this.calculateTakeAmountBeforeFees(amountOut)
    const asks = [...this.asks.map((depth) => ({ ...depth }))]
    const bids = [...this.bids.map((depth) => ({ ...depth }))]
    let amountIn: bigint = 0n
    if (
      isAddressEqual(
        tokenIn as `0x${string}`,
        this.quoteToken.address as `0x${string}`,
      )
    ) {
      while (asks.length > 0) {
        const { price, rawAmount } = asks[0]
        const amountOutRaw = this.baseToRaw(amountOut, price, true)
        if (amountOutRaw >= rawAmount) {
          amountOut -= this.rawToBase(rawAmount, price, true)
          amountIn += this.rawToQuote(rawAmount)
          asks.shift()
        } else {
          amountIn += this.rawToQuote(amountOutRaw)
          asks[0].rawAmount = rawAmount - amountOutRaw
          break
        }
      }
    } else {
      while (bids.length > 0) {
        const { price, rawAmount } = bids[0]
        const amountOutRaw = this.quoteToRaw(amountOut, true)
        if (amountOutRaw >= rawAmount) {
          amountOut -= this.rawToQuote(rawAmount)
          amountIn += this.rawToBase(rawAmount, price, true)
          bids.shift()
        } else {
          amountIn += this.rawToBase(amountOutRaw, price, true)
          bids[0].rawAmount = rawAmount - amountOutRaw
          break
        }
      }
    }
    return {
      amountIn,
      market: MarketV1.from(this, bids, asks),
    }
  }

  totalBidsInBaseAfterFees(): bigint {
    const totalBidsInBase = this.bids.reduce(
      (acc, val) => acc + this.rawToBase(val.rawAmount, val.price, false),
      0n,
    )
    return this.divide(
      totalBidsInBase * (this.FEE_PRECISION - this.takerFee),
      this.FEE_PRECISION,
      false,
    )
  }

  totalAsksInBaseAfterFees(): bigint {
    const totalAsksInBase = this.asks.reduce(
      (acc, val) => acc + this.rawToBase(val.rawAmount, val.price, false),
      0n,
    )
    return this.divide(
      totalAsksInBase * (this.FEE_PRECISION - this.takerFee),
      this.FEE_PRECISION,
      false,
    )
  }
}
