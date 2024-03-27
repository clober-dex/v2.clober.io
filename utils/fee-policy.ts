import { FeePolicy } from '../model/fee-policy'

export const isFeePolicyEqual = (a: FeePolicy, b: FeePolicy) => {
  return a.rate === b.rate && a.usesQuote === b.usesQuote
}
