import BigNumber from 'bignumber.js'
import { Depth, Market } from '@clober/v2-sdk'

import { Decimals } from '../model/decimals'

import { toPlacesString } from './bignumber'
import { formatUnits } from './bigint'

export function calculateOutputCurrencyAmountString(
  isBid: boolean,
  inputCurrencyAmount: string,
  priceInput: string,
  outputCurrencyDecimals: number,
) {
  const outputCurrencyAmount = isBid
    ? new BigNumber(inputCurrencyAmount).div(priceInput)
    : new BigNumber(inputCurrencyAmount).times(priceInput)
  return toPlacesString(
    outputCurrencyAmount.isNaN() || !outputCurrencyAmount.isFinite()
      ? new BigNumber(0)
      : outputCurrencyAmount,
    outputCurrencyDecimals,
  )
}

export function calculatePriceInputString(
  isBid: boolean,
  inputCurrencyAmount: string,
  outputCurrencyAmount: string,
  currentPriceInput: string,
) {
  const expectedPriceInput = isBid
    ? new BigNumber(inputCurrencyAmount).div(outputCurrencyAmount)
    : new BigNumber(inputCurrencyAmount).times(outputCurrencyAmount)
  return expectedPriceInput.isNaN() || !expectedPriceInput.isFinite()
    ? currentPriceInput
    : toPlacesString(expectedPriceInput)
}

export function parseDepth(
  isBid: boolean,
  market: Market,
  decimalPlaces: Decimals,
): {
  price: string
  size: string
}[] {
  return Array.from(
    [...(isBid ? market.bids : market.asks).map((depth) => ({ ...depth }))]
      .sort((a, b) => (isBid ? b.price - a.price : a.price - b.price))
      .map((x) => {
        return {
          price: x.price,
          size: new BigNumber(formatUnits(x.baseAmount, market.base.decimals)),
        }
      })
      .reduce(
        (prev, curr) => {
          const price = new BigNumber(curr.price)
          const key = new BigNumber(price).toFixed(
            decimalPlaces.value,
            BigNumber.ROUND_FLOOR,
          )
          prev.set(
            key,
            prev.has(key)
              ? {
                  price: key,
                  size: curr.size.plus(prev.get(key)?.size || 0),
                }
              : {
                  price: key,
                  size: curr.size,
                },
          )
          return prev
        },
        new Map<
          string,
          {
            price: string
            size: BigNumber
          }
        >(),
      )
      .values(),
  ).map((x) => {
    return {
      price: x.price,
      size: toPlacesString(x.size, market.base.decimals),
    }
  })
}

export const isOrderBookEqual = (a: Depth[], b: Depth[]) => {
  if (a.length !== b.length) {
    return false
  }
  const sortedA = a.sort((x, y) => x.price - y.price)
  const sortedB = b.sort((x, y) => x.price - y.price)
  return sortedA.every((x, i) => {
    return (
      x.price === sortedB[i].price && x.baseAmount === sortedB[i].baseAmount
    )
  })
}
