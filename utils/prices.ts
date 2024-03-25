import BigNumber from 'bignumber.js'

import { getDecimalPlaces } from './bignumber'

export const getPriceDecimals = (
  price: bigint,
  inputCurrencyDecimals: number,
  outputCurrencyDecimals: number,
  r: number = 1.001,
) => {
  const priceNumber = new BigNumber(
    formatPrice(price, inputCurrencyDecimals, outputCurrencyDecimals),
  )
  return getDecimalPlaces(
    new BigNumber(r).multipliedBy(priceNumber).minus(priceNumber),
    1,
  )
}

export const formatPrice = (
  price: bigint,
  inputCurrencyDecimals: number,
  outputCurrencyDecimals: number,
): number => {
  return (
    (Number(price) / Math.pow(2, 128)) *
    10 ** (outputCurrencyDecimals - inputCurrencyDecimals)
  )
}

export const formatInvertedPrice = (
  price: bigint,
  quoteDecimals: number,
  baseDecimals: number,
): number => {
  return (
    (Math.pow(2, 128) / Number(price)) * 10 ** (quoteDecimals - baseDecimals)
  )
}

export const parsePrice = (
  price: number,
  inputCurrencyDecimals: number,
  outputCurrencyDecimals: number,
): bigint => {
  return BigInt(
    price *
      Math.pow(2, 128) *
      Math.pow(10, inputCurrencyDecimals - outputCurrencyDecimals),
  )
}
