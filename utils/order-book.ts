import BigNumber from 'bignumber.js'
import { zeroAddress } from 'viem'

import { Decimals } from '../model/decimals'
import { Currency } from '../model/currency'
import { WrappedEthers } from '../constants/weths'
import { Balances } from '../model/balances'
import { Market } from '../model/market'

import { toPlacesString } from './bignumber'
import { PRICE_DECIMAL } from './prices'
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
    : toPlacesString(expectedPriceInput, PRICE_DECIMAL)
}

export function parseDepth(
  isBid: boolean,
  market: Market,
  decimalPlaces: Decimals,
): { price: string; size: string }[] {
  return Array.from(
    [...(isBid ? market.bids : market.asks).map((depth) => ({ ...depth }))]
      .sort((a, b) =>
        isBid
          ? Number(b.tick) - Number(a.tick)
          : Number(a.tick) - Number(b.tick),
      )
      .map((x) => {
        return {
          price: formatUnits(x.price, PRICE_DECIMAL),
          size: new BigNumber(formatUnits(x.baseAmount, market.base.decimals)),
        }
      })
      .reduce((prev, curr) => {
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
      }, new Map<string, { price: string; size: BigNumber }>())
      .values(),
  ).map((x) => {
    return {
      price: x.price,
      size: toPlacesString(x.size, market.base.decimals),
    }
  })
}

export function calculateValue(
  inputCurrency: Currency,
  amountIn: bigint,
  claimBounty: bigint,
  gasProtection: bigint,
  balances: Balances,
): {
  value: bigint
  useNative: boolean
  withClaim: boolean
} {
  if (!WrappedEthers.includes(inputCurrency.address)) {
    return {
      value: claimBounty,
      useNative: false,
      withClaim: amountIn > balances[inputCurrency.address] ?? 0n,
    }
  }

  // wrapped balance is enough
  if (amountIn <= balances[inputCurrency.address] ?? 0n) {
    return {
      value: claimBounty,
      useNative: false,
      withClaim: false,
    }
  }

  // wrapped balance + native balance excluding gas protection is enough
  const availableWithoutClaimBalance =
    (balances[inputCurrency.address] ?? 0n) +
    (balances[zeroAddress] ?? 0n) -
    gasProtection
  if (amountIn <= availableWithoutClaimBalance) {
    return {
      value: claimBounty + amountIn - (balances[inputCurrency.address] ?? 0n),
      useNative: true,
      withClaim: false,
    }
  }

  // needs claim
  return {
    value: (balances[zeroAddress] ?? 0n) - gasProtection,
    useNative: true,
    withClaim: true,
  }
}
