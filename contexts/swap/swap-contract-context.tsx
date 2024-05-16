import React, { useCallback } from 'react'
import { isAddressEqual, zeroAddress } from 'viem'
import { useQueryClient, useWalletClient } from 'wagmi'
import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { formatUnits } from '../../utils/bigint'
import { fetchSwapData } from '../../apis/swap/data'
import { AGGREGATORS } from '../../constants/aggregators'
import { CHAIN_IDS } from '../../constants/chain'
import { approve20 } from '../../utils/approve20'
import { useChainContext } from '../chain-context'
import { useTransactionContext } from '../transaction-context'
import { toPlacesString } from '../../utils/bignumber'
import { sendTransaction } from '../../utils/wallet'

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
          fields: [
            {
              currency: inputCurrency,
              label: inputCurrency.symbol,
              value: toPlacesString(
                formatUnits(amountIn, inputCurrency.decimals),
              ),
            },
          ],
        })

        let transaction = await fetchSwapData(
          AGGREGATORS[selectedChain.id as CHAIN_IDS],
          inputCurrency,
          amountIn,
          outputCurrency,
          slippageLimitPercent,
          gasPrice,
          userAddress,
        )

        if (!isAddressEqual(inputCurrency.address, zeroAddress)) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [
              {
                currency: inputCurrency,
                label: inputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(amountIn, inputCurrency.decimals),
                ),
              },
            ],
          })
          await approve20(
            selectedChain.id,
            walletClient,
            inputCurrency,
            userAddress,
            transaction.to,
            amountIn,
          )

          transaction = await fetchSwapData(
            AGGREGATORS[selectedChain.id as CHAIN_IDS],
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
              value: toPlacesString(
                formatUnits(amountIn, inputCurrency.decimals),
              ),
            },
          ],
        })
        await sendTransaction(walletClient, transaction as Transaction)
      } catch (e) {
        console.error(e)
      } finally {
        await queryClient.invalidateQueries(['swap-balances'])
        setConfirmation(undefined)
      }
    },
    [walletClient, selectedChain.id, setConfirmation, queryClient],
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
