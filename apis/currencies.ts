import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'

import { Currency } from '../model/currency'
import { WHITELISTED_CURRENCIES } from '../constants/currency'
import { fetchCurrencyIcons } from '../utils/currency'

import { fetchApi } from './utils'

export async function fetchWhitelistCurrencies(chainId: CHAIN_IDS) {
  try {
    const currencies: Currency[] = Object.entries(
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
    const result = WHITELISTED_CURRENCIES[chainId].concat(currencies)
    const icons = await fetchCurrencyIcons(
      result.map((currency) => currency.symbol),
    )
    result.forEach((currency) => {
      currency.icon = icons[currency.symbol]
    })
    return result
  } catch (e) {
    return WHITELISTED_CURRENCIES[chainId]
  }
}
