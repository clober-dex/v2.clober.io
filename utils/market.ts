import { Market } from '@clober/v2-sdk'

import { isCurrencyEqual } from './currency'

export const isMarketEqual = (a: Market | undefined, b: Market | undefined) => {
  if (!a || !b) {
    return false
  }
  return (
    a.chainId === b.chainId &&
    isCurrencyEqual(a.quote, b.quote) &&
    isCurrencyEqual(a.base, b.base)
  )
}
