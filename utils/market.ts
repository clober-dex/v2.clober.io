import { Market } from '@clober/v2-sdk'

import { Chain } from '../model/chain'

import { isCurrencyEqual } from './currency'

export const LOCAL_STORAGE_IS_OPENED = (
  context: string,
  chain: Chain,
  tokens: [`0x${string}`, `0x${string}`],
  isBid: boolean,
) =>
  `${chain.id}-${tokens.sort().join('-')}-${
    isBid ? 'bidBook' : 'askBook'
  }-${context}`

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
