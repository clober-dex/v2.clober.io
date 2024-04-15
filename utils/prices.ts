import BigNumber from 'bignumber.js'

import { getDecimalPlaces } from './bignumber'

export const getPriceDecimals = (price: number, r: number = 1.001) => {
  const priceNumber = new BigNumber(price)
  return getDecimalPlaces(
    new BigNumber(r).multipliedBy(priceNumber).minus(priceNumber),
    1,
  )
}
