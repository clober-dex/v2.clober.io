import { divide } from '../utils/tick'

export class FeePolicy {
  readonly RATE_PRECISION = 10n ** 6n
  static readonly MAX_FEE_RATE = 500000n
  static readonly MIN_FEE_RATE = -500000n
  static readonly RATE_MASK = 0x7fffffn

  public usesQuote: boolean
  public value: bigint

  constructor(usesQuote: boolean, rate: bigint) {
    this.usesQuote = usesQuote

    if (rate > FeePolicy.MAX_FEE_RATE || rate < FeePolicy.MIN_FEE_RATE) {
      throw new Error('InvalidFeePolicy')
    }
    const mask = usesQuote ? 1n << 23n : 0n
    this.value = (rate + FeePolicy.MAX_FEE_RATE) | mask
  }

  private static rate = (value: bigint): bigint => {
    return (value & FeePolicy.RATE_MASK) - FeePolicy.MAX_FEE_RATE
  }

  public calculateFee = (amount: bigint, reverseRounding: boolean): bigint => {
    const r = FeePolicy.rate(this.value)

    const positive = r > 0n
    const absRate = positive ? r : -r
    const absFee = divide(
      amount * absRate,
      this.RATE_PRECISION,
      reverseRounding ? !positive : positive,
    )
    return positive ? absFee : -absFee
  }

  public calculateOriginalAmount = (
    amount: bigint,
    reverseFee: boolean,
  ): bigint => {
    const r = FeePolicy.rate(this.value)

    const positive = r > 0
    const divider = this.RATE_PRECISION + (reverseFee ? -r : r)
    return divide(amount * this.RATE_PRECISION, divider, positive)
  }

  public static from(value: bigint): FeePolicy {
    const usesQuote = value >> 23n > 0n
    return new FeePolicy(usesQuote, FeePolicy.rate(value))
  }
}
