import React, { useCallback } from 'react'
import { usePublicClient, useQueryClient, useWalletClient } from 'wagmi'
import { isAddressEqual, zeroAddress, zeroHash } from 'viem'

import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'
import { useTransactionContext } from '../transaction-context'
import { CHAIN_IDS } from '../../constants/chain'
import { CONTRACT_ADDRESSES } from '../../constants/addresses'
import { permit20 } from '../../utils/permit20'
import { getDeadlineTimestampInSeconds } from '../../utils/date'
import { Market } from '../../model/market'
import { toPlacesString } from '../../utils/bignumber'
import { formatUnits } from '../../utils/bigint'
import { toId } from '../../utils/book-id'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../../constants/fee'
import { writeContract } from '../../utils/wallet'
import { CONTROLLER_ABI } from '../../abis/core/controller-abi'
import { WETH_ADDRESSES } from '../../constants/currency'
import { fromPrice } from '../../model/tick'

type LimitContractContext = {
  make: (
    market: Market,
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: bigint,
    price: bigint,
  ) => Promise<void>
}

const Context = React.createContext<LimitContractContext>({
  make: () => Promise.resolve(),
})

export const LimitContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { selectedChain } = useChainContext()

  const make = useCallback(
    async (
      market: Market,
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: bigint,
      price: bigint,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const tick = fromPrice(price * 2n ** 128n)
      const isBid = isAddressEqual(inputCurrency.address, market.quote.address)
      try {
        const permitAmount = !isAddressEqual(inputCurrency.address, zeroAddress)
          ? amount
          : 0n
        const { deadline, r, s, v } = await permit20(
          selectedChain.id,
          walletClient,
          inputCurrency,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          permitAmount,
          getDeadlineTimestampInSeconds(),
        )

        setConfirmation({
          title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
          body: 'Please confirm in your wallet.',
          fields: [
            {
              currency: inputCurrency,
              label: inputCurrency.symbol,
              value: toPlacesString(
                formatUnits(amount, inputCurrency.decimals),
              ),
            },
          ],
        })

        const param = {
          id: toId({
            base: outputCurrency.address,
            unit: 1n, // todo
            quote: inputCurrency.address,
            makerPolicy: MAKER_DEFAULT_POLICY,
            hooks: zeroAddress,
            takerPolicy: TAKER_DEFAULT_POLICY,
          }),
          tick,
          quoteAmount: amount,
          hookData: zeroHash,
        }
        const tokensToSettle = [inputCurrency.address, outputCurrency.address]
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        await writeContract(publicClient, walletClient, {
          address: CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          abi: CONTROLLER_ABI,
          functionName: 'make',
          args: [
            [param],
            tokensToSettle,
            [
              {
                token: inputCurrency.address,
                permitAmount,
                signature: { deadline, v, r, s },
              },
            ],
            getDeadlineTimestampInSeconds(),
          ],
          value: isAddressEqual(inputCurrency.address, zeroAddress)
            ? amount
            : 0n,
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['limit-balances']),
          queryClient.invalidateQueries(['open-orders']),
          queryClient.invalidateQueries(['markets']),
        ])
        setConfirmation(undefined)
      }
    },
    [publicClient, queryClient, selectedChain, setConfirmation, walletClient],
  )

  return <Context.Provider value={{ make }}>{children}</Context.Provider>
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
