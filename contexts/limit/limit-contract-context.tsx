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
import { toPlacesString } from '../../utils/bignumber'
import { formatUnits } from '../../utils/bigint'
import { toId } from '../../utils/book-id'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../../constants/fee'
import { writeContract } from '../../utils/wallet'
import { CONTROLLER_ABI } from '../../abis/core/controller-abi'
import { WETH_ADDRESSES } from '../../constants/currency'
import { fromPrice } from '../../utils/tick'
import { calculateUnit } from '../../utils/unit'
import { isOpen } from '../../utils/book'
import { BookKey } from '../../model/book-key'
import { getMarketId } from '../../utils/market'
import { OpenOrder } from '../../model/open-order'
import { permit721 } from '../../utils/permit721'

type LimitContractContext = {
  make: (
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: bigint,
    price: bigint,
  ) => Promise<void>
  cancels: (openOrders: OpenOrder[]) => Promise<void>
}

const Context = React.createContext<LimitContractContext>({
  make: () => Promise.resolve(),
  cancels: () => Promise.resolve(),
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
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: bigint,
      price: bigint,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const tick = fromPrice(price)
      const { quote } = getMarketId(selectedChain.id, [
        inputCurrency.address,
        outputCurrency.address,
      ])
      const isBid = isAddressEqual(inputCurrency.address, quote)
      try {
        const unit = await calculateUnit(selectedChain.id, inputCurrency)
        const key: BookKey = {
          base: outputCurrency.address,
          unit,
          quote: inputCurrency.address,
          makerPolicy: MAKER_DEFAULT_POLICY,
          hooks: zeroAddress,
          takerPolicy: TAKER_DEFAULT_POLICY,
        }
        const param = {
          id: toId(key),
          tick,
          quoteAmount: amount,
          hookData: zeroHash,
        }

        const open = await isOpen(selectedChain.id, key)
        if (!open) {
          setConfirmation({
            title: `Open Book`,
            body: 'Please confirm in your wallet.',
            fields: [],
          })

          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'open',
            args: [
              [
                {
                  key: {
                    base: key.base,
                    unit: Number(key.unit),
                    quote: key.quote,
                    makerPolicy: Number(key.makerPolicy.value),
                    hooks: key.hooks,
                    takerPolicy: Number(key.takerPolicy.value),
                  },
                  hookData: param.hookData,
                },
              ],
              getDeadlineTimestampInSeconds(),
            ],
          })
        }

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

  const cancels = useCallback(
    async (openOrders: OpenOrder[]) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const refundCurrencyMaps: {
        [currency: `0x${string}`]: { currency: Currency; amount: bigint }
      } = openOrders.reduce(
        (acc, order) => {
          const refundCurrency = order.inputToken
          if (!acc[refundCurrency.address]) {
            acc[refundCurrency.address] = {
              currency: refundCurrency,
              amount: 0n,
            }
          }
          acc[refundCurrency.address].amount += order.quoteAmount
          return acc
        },
        {} as {
          [currency: `0x${string}`]: { currency: Currency; amount: bigint }
        },
      )

      try {
        const permitParamsList: {
          tokenId: bigint
          signature: {
            deadline: bigint
            r: `0x${string}`
            s: `0x${string}`
            v: number
          }
        }[] = []
        for (const openOrder of openOrders) {
          const { deadline, r, s, v } = await permit721(
            selectedChain.id,
            walletClient,
            CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
            openOrder.id,
            walletClient.account.address,
            CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            getDeadlineTimestampInSeconds(),
          )
          permitParamsList.push({
            tokenId: openOrder.id,
            signature: { deadline, v, r, s },
          })
        }

        setConfirmation({
          title: `Cancel Order`,
          body: 'Please confirm in your wallet.',
          fields: Object.values(refundCurrencyMaps).map(
            ({ currency, amount }) => ({
              currency,
              direction: 'in',
              label: currency.symbol,
              value: toPlacesString(formatUnits(amount, currency.decimals)),
            }),
          ),
        })

        //   function cancel(
        //       CancelOrderParams[] calldata orderParamsList,
        //       address[] calldata tokensToSettle,
        //       ERC721PermitParams[] calldata permitParamsList,
        //       uint64 deadline
        // ) external;

        const tokensToSettle = Object.values(refundCurrencyMaps)
          .map(({ currency }) => currency.address)
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        await writeContract(publicClient, walletClient, {
          address: CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          abi: CONTROLLER_ABI,
          functionName: 'cancel',
          args: [
            openOrders.map((order) => ({
              id: order.id,
              leftQuoteAmount: 0n,
              hookData: zeroHash,
            })),
            tokensToSettle,
            permitParamsList,
            getDeadlineTimestampInSeconds(),
          ],
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

  return (
    <Context.Provider value={{ make, cancels }}>{children}</Context.Provider>
  )
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
