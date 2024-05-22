import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'

import { Currency } from '../model/currency'
import { WHITELISTED_CURRENCIES } from '../constants/currency'

import { fetchApi } from './utils'

export async function fetchWhitelistCurrencies(chainId: CHAIN_IDS) {
  try {
    const currencies = Object.entries(
      (
        await fetchApi<{
          tokenMap: Currency[]
        }>('https://api.odos.xyz', `info/tokens/${chainId}`)
      ).tokenMap,
    ).map(([address, currency]) => ({
      address: getAddress(address),
      name: currency.name,
      symbol: currency.symbol,
      decimals: currency.decimals,
    }))
    return WHITELISTED_CURRENCIES[chainId].concat(currencies)
  } catch (e) {
    return WHITELISTED_CURRENCIES[chainId]
  }
}
