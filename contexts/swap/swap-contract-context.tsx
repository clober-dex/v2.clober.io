import React, { useCallback } from 'react'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { useQueryClient, useWalletClient } from 'wagmi'
import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { formatUnits } from '../../utils/bigint'
import { fetchSwapData } from '../../apis/swap/data'
import { AGGREGATORS } from '../../constants/aggregators'
import { useChainContext } from '../chain-context'
import { useTransactionContext } from '../transaction-context'
import { sendTransaction } from '../../utils/transaction'
import { useCurrencyContext } from '../currency-context'
import { maxApprove } from '../../utils/approve20'

type SwapContractContext = {
  swap: (
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress: `0x${string}`,
  ) => Promise<void>
}

const Context = React.createContext<SwapContractContext>({
  swap: () => Promise.resolve(),
})

export const SwapContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const { selectedChain } = useChainContext()
  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { allowances, prices } = useCurrencyContext()

  const swap = useCallback(
    async (
      inputCurrency: Currency,
      amountIn: bigint,
      outputCurrency: Currency,
      slippageLimitPercent: number,
      gasPrice: bigint,
      userAddress: `0x${string}`,
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

        let swapData = await fetchSwapData(
          AGGREGATORS[selectedChain.id],
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
          allowances[spender][inputCurrency.address] === 0n
        ) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await maxApprove(walletClient, inputCurrency, spender)

          swapData = await fetchSwapData(
            AGGREGATORS[selectedChain.id],
            inputCurrency,
            amountIn,
            outputCurrency,
            slippageLimitPercent,
            gasPrice,
            userAddress,
          )
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
                swapData.amountOut,
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
    [walletClient, setConfirmation, selectedChain.id, allowances, queryClient],
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
