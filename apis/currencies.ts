import { CHAIN_IDS } from '@clober/v2-sdk'

import { WHITELISTED_CURRENCIES } from '../constants/currency'
import { Currency } from '../model/currency'
import { AGGREGATORS } from '../constants/aggregators'

export async function fetchWhitelistCurrencies(
  chainId: CHAIN_IDS,
): Promise<Currency[]> {
  try {
    const currencies = await Promise.all(
      AGGREGATORS[chainId].map((aggregator) => aggregator.currencies()),
    )
    return WHITELISTED_CURRENCIES[chainId]
      .concat(currencies.flat())
      .map((currency) => ({ ...currency, isVerified: true }))
  } catch (e) {
    return WHITELISTED_CURRENCIES[chainId].map((currency) => ({
      ...currency,
      isVerified: true,
    }))
  }
}
