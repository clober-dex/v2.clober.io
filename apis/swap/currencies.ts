import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'

export async function fetchCurrencies(
  aggregators: Aggregator[],
): Promise<Currency[]> {
  const currencies = await Promise.all(
    aggregators.map((aggregator) => aggregator.currencies()),
  )
  return currencies.flat()
}
