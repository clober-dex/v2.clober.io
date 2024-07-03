import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'
import { fetchCurrencyIcons } from '../../utils/currency'

export async function fetchCurrencies(
  aggregators: Aggregator[],
): Promise<Currency[]> {
  const currencies = await Promise.all(
    aggregators.map((aggregator) => aggregator.currencies()),
  )
  const result = currencies.flat()

  const icons = await fetchCurrencyIcons(
    result.map((currency) => currency.symbol),
  )
  result.forEach((currency) => {
    if (!currency.icon) {
      currency.icon = icons[currency.symbol]
    }
  })
  return result
}
