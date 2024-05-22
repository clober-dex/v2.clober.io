import { Aggregator } from '../../model/aggregator'
import { Currency } from '../../model/currency'

import { fetchQuotes } from './quotes'

export async function fetchSwapData(
  aggregators: Aggregator[],
  inputCurrency: Currency,
  amountIn: bigint,
  outputCurrency: Currency,
  slippageLimitPercent: number,
  gasPrice: bigint,
  userAddress?: `0x${string}`,
): Promise<{
  transaction: {
    data: `0x${string}`
    gas: bigint
    value: bigint
    to: `0x${string}`
    nonce?: number
    gasPrice?: bigint
  }
  amountOut: bigint
}> {
  const { aggregator, amountOut } = await fetchQuotes(
    aggregators,
    inputCurrency,
    amountIn,
    outputCurrency,
    slippageLimitPercent,
    gasPrice,
    userAddress,
  )
  const transaction = await aggregator.buildCallData(
    inputCurrency,
    amountIn,
    outputCurrency,
    slippageLimitPercent,
    gasPrice,
    userAddress,
  )
  return {
    transaction,
    amountOut,
  }
}
