import { Aggregator } from '../../model/aggregator'
import { Currency } from '../../model/currency'

export async function fetchSwapData(
  aggregator: Aggregator,
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
}> {
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
  }
}
