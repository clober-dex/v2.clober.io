import BigNumber from 'bignumber.js'

import { findFirstNonZeroIndex } from './bignumber'

export const getPriceDecimals = (price: number, r: number = 1.0001) => {
  const priceNumber = new BigNumber(price)
  const priceDiff = new BigNumber(r)
    .multipliedBy(priceNumber)
    .minus(priceNumber)
  return findFirstNonZeroIndex(priceDiff) + 1
}
