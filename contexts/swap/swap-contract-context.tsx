import React, { useCallback } from 'react'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { useQueryClient, useWalletClient } from 'wagmi'
import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { formatUnits } from '../../utils/bigint'
import { fetchSwapData } from '../../apis/swap/data'
import { useChainContext } from '../chain-context'
import { useTransactionContext } from '../transaction-context'
import { sendTransaction } from '../../utils/transaction'
import { useCurrencyContext } from '../currency-context'
import { maxApprove } from '../../utils/approve20'
import { Aggregator } from '../../model/aggregator'

type SwapContractContext = {
  swap: (
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    expectedAmountOut: bigint,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress: `0x${string}`,
    aggregator: Aggregator,
  ) => Promise<void>
}

const Context = React.createContext<SwapContractContext>({
  swap: () => Promise.resolve(),
})

export const SwapContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { allowances, prices } = useCurrencyContext()

  const swap = useCallback(
    async (
      inputCurrency: Currency,
      amountIn: bigint,
      outputCurrency: Currency,
      expectedAmountOut: bigint,
      slippageLimitPercent: number,
      gasPrice: bigint,
      userAddress: `0x${string}`,
      aggregator: Aggregator,
    ) => {
      if (!walletClient) {
        return
      }

      try {
        setConfirmation({
          title: 'Swap',
          body: 'Please confirm in your wallet.',
          fields: [],
        })

        const swapData = await fetchSwapData(
          aggregator,
          inputCurrency,
          amountIn,
          outputCurrency,
          slippageLimitPercent,
          gasPrice,
          userAddress,
        )

        const spender = getAddress(swapData.transaction.to)
        if (
          !isAddressEqual(inputCurrency.address, zeroAddress) &&
          allowances[spender][inputCurrency.address] < amountIn
        ) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await maxApprove(walletClient, inputCurrency, spender)
        }

        setConfirmation({
          title: 'Swap',
          body: 'Please confirm in your wallet.',
          fields: [
            {
              currency: inputCurrency,
              label: inputCurrency.symbol,
              direction: 'in',
              value: formatUnits(
                amountIn,
                inputCurrency.decimals,
                prices[inputCurrency.address] ?? 0,
              ),
            },
            {
              currency: outputCurrency,
              label: outputCurrency.symbol,
              direction: 'out',
              value: formatUnits(
                expectedAmountOut,
                outputCurrency.decimals,
                prices[outputCurrency.address] ?? 0,
              ),
            },
          ],
        })
        await sendTransaction(walletClient, swapData.transaction as Transaction)
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['balances']),
          queryClient.invalidateQueries(['allowances']),
        ])
        setConfirmation(undefined)
      }
    },
    [walletClient, setConfirmation, allowances, prices, queryClient],
  )

  return (
    <Context.Provider
      value={{
        swap,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useSwapContractContext = () =>
  React.useContext(Context) as SwapContractContext
