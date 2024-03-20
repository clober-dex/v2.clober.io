import { divide } from './tick'

const MAX_FEE_RATE = 500000n
const MIN_FEE_RATE = -500000n
const RATE_PRECISION = 10n ** 6n

export const encodeToFeePolicy = (usesQuote: boolean, rate: bigint): bigint => {
  if (rate > MAX_FEE_RATE || rate < MIN_FEE_RATE) {
    throw new Error('InvalidFeePolicy')
  }
  const mask = usesQuote ? 1n << 23n : 0n
  return (rate + MAX_FEE_RATE) | mask
}

export const getUsesQuote = (feePolicy: bigint): boolean => {
  return feePolicy >> 23n > 0n
}

const rate = (feePolicy: bigint): bigint => {
  return (feePolicy & 0x7fffffn) - MAX_FEE_RATE
}

export const calculateFee = (
  feePolicy: bigint,
  amount: bigint,
  reverseRounding: boolean,
): bigint => {
  const r = rate(feePolicy)

  const positive = r > 0n
  const absRate = positive ? r : -r
  const absFee = divide(
    amount * absRate,
    RATE_PRECISION,
    reverseRounding ? !positive : positive,
  )
  return positive ? absFee : -absFee
}

export const calculateOriginalAmount = (
  feePolicy: bigint,
  amount: bigint,
  reverseFee: boolean,
): bigint => {
  const r = rate(feePolicy)

  const positive = r > 0
  const divider = RATE_PRECISION + (reverseFee ? -r : r)
  return divide(amount * RATE_PRECISION, divider, positive)
}
