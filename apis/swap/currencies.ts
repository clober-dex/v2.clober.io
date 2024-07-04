import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'
import { WHITELISTED_CURRENCIES } from '../../constants/currency'

export async function fetchCurrencies(
  chainId: CHAIN_IDS,
  aggregators: Aggregator[],
): Promise<Currency[]> {
  const currencies = await Promise.all(
    aggregators.map((aggregator) => aggregator.currencies()),
  )
  return WHITELISTED_CURRENCIES[chainId].concat(currencies.flat())
}
