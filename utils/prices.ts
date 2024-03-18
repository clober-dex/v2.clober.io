import BigNumber from 'bignumber.js'

import { getDecimalPlaces } from './bignumber'
import { formatUnits } from './bigint'

export const PRICE_DECIMAL = 18

export const getPriceDecimals = (
  price: bigint,
  r: bigint = 1001000000000000000n,
) => {
  const priceNumber = new BigNumber(formatUnits(price, PRICE_DECIMAL))
  return getDecimalPlaces(
    new BigNumber(formatUnits(r, PRICE_DECIMAL))
      .multipliedBy(priceNumber)
      .minus(priceNumber),
    1,
  )
}
