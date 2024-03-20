const MAX_FEE_RATE = 500000n
const MIN_FEE_RATE = -500000n
export const encodeToFeePolicy = (usesQuote: boolean, rate: bigint): bigint => {
  if (rate > MAX_FEE_RATE || rate < MIN_FEE_RATE) {
    throw new Error('InvalidFeePolicy')
  }
  const mask = usesQuote ? 1n << 23n : 0n
  return (rate + MAX_FEE_RATE) | mask
}
