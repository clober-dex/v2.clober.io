import BigNumber from 'bignumber.js'

import { getDecimalPlaces } from './bignumber'

export const MAX_PRICE =
  19961636804996334433808922353085948875386438476189866322430503n

export const getPriceDecimals = (price: number, r: number = 1.001) => {
  const priceNumber = new BigNumber(price)
  return getDecimalPlaces(
    new BigNumber(r).multipliedBy(priceNumber).minus(priceNumber),
    1,
  )
}

export const formatPrice = (
  price: bigint,
  quoteDecimals: number,
  baseDecimals: number,
): number => {
  return (
    (Number(price) / Math.pow(2, 128)) * 10 ** (baseDecimals - quoteDecimals)
  )
}

export const parsePrice = (
  price: number,
  quoteDecimals: number,
  baseDecimals: number,
): bigint => {
  return BigInt(
    price * Math.pow(2, 128) * Math.pow(10, quoteDecimals - baseDecimals),
  )
}
