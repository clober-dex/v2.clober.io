import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { Market } from '@clober/v2-sdk'

import { STABLE_COIN_ADDRESSES, WETH_ADDRESSES } from '../constants/currency'

import { isCurrencyEqual } from './currency'
import { isOrderBookEqual } from './order-book'

export const getMarketId = (
  chainId: number,
  tokenAddresses: `0x${string}`[],
) => {
  if (tokenAddresses.length !== 2) {
    throw new Error('Invalid token pair')
  }
  tokenAddresses = tokenAddresses.map((address) => getAddress(address))

  // include stable coin
  const stable = tokenAddresses.find((address) => {
    return STABLE_COIN_ADDRESSES[chainId]
      .map((addresses) => getAddress(addresses))
      .some((addresses) => addresses.includes(address))
  })
  if (stable) {
    const other = tokenAddresses.find(
      (address) => !isAddressEqual(address, stable),
    )!
    return {
      marketId: `${other}/${stable}`,
      quote: stable,
      base: other,
    }
  }

  // include eth
  const eth = tokenAddresses.find((address) =>
    isAddressEqual(address, zeroAddress),
  )
  if (eth) {
    const other = tokenAddresses.find(
      (address) => !isAddressEqual(address, zeroAddress),
    )!
    return {
      marketId: `${other}/${eth}`,
      quote: eth,
      base: other,
    }
  }

  // include weth
  const weth = tokenAddresses.find((address) => {
    return WETH_ADDRESSES[chainId]
      .map((addresses) => getAddress(addresses))
      .some((addresses) => addresses.includes(address))
  })
  if (weth) {
    const other = tokenAddresses.find(
      (address) => !isAddressEqual(address, weth),
    )!
    return {
      marketId: `${other}/${weth}`,
      quote: weth,
      base: other,
    }
  }

  const _tokens = tokenAddresses.sort((a, b) => a.localeCompare(b))
  return {
    marketId: `${_tokens[0]}/${_tokens[1]}`,
    quote: _tokens[0],
    base: _tokens[1],
  }
}

export const isMarketEqual = (a: Market | undefined, b: Market | undefined) => {
  if (!a || !b) {
    return false
  }
  return (
    isCurrencyEqual(a.quote, b.quote) &&
    isCurrencyEqual(a.base, b.base) &&
    a.makerFee === b.makerFee &&
    a.takerFee === b.takerFee &&
    a.askBookOpen === b.askBookOpen &&
    a.bidBookOpen === b.bidBookOpen &&
    isOrderBookEqual(a.bids, b.bids) &&
    isOrderBookEqual(a.asks, b.asks)
  )
}
