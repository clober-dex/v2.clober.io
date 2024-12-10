import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'
import { PathViz } from '../../model/pathviz'

export async function fetchQuotes(
  aggregators: Aggregator[],
  inputCurrency: Currency,
  amountIn: bigint,
  outputCurrency: Currency,
  slippageLimitPercent: number,
  gasPrice: bigint,
  userAddress?: `0x${string}`,
): Promise<{
  amountIn: bigint
  amountOut: bigint
  gasLimit: bigint
  pathViz: PathViz | undefined
  aggregator: Aggregator
}> {
  const quotes = await Promise.all(
    aggregators.map((aggregator) =>
      aggregator.quote(
        inputCurrency,
        amountIn,
        outputCurrency,
        slippageLimitPercent,
        gasPrice,
        userAddress,
      ),
    ),
  )
  return {
    ...quotes.reduce((best, quote) => {
      if (quote.amountOut > best.amountOut) {
        return quote
      }
      return best
    }),
    amountIn,
  }
}
