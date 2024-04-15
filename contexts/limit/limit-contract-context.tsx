import React, { useCallback } from 'react'
import { useQueryClient, useWalletClient } from 'wagmi'
import { isAddressEqual, parseUnits, zeroAddress } from 'viem'
import {
  cancelOrders,
  claimOrders,
  getMarket,
  limitOrder,
  openMarket,
  OpenOrder,
  PermitSignature,
} from '@clober/v2-sdk'

import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'
import { Confirmation, useTransactionContext } from '../transaction-context'
import { CHAIN_IDS } from '../../constants/chain'
import { CONTRACT_ADDRESSES } from '../../constants/addresses'
import { permit20 } from '../../utils/permit20'
import { getDeadlineTimestampInSeconds } from '../../utils/date'
import { toPlacesString } from '../../utils/bignumber'
import { sendTransaction, writeContract } from '../../utils/wallet'
import { fetchIsApprovedForAll } from '../../utils/approval'
import { ERC721_ABI } from '../../abis/@openzeppelin/erc721-abi'

type LimitContractContext = {
  limit: (
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: string,
    price: string,
    postOnly: boolean,
  ) => Promise<void>
  cancels: (openOrders: OpenOrder[]) => Promise<void>
  claims: (openOrders: OpenOrder[]) => Promise<void>
}

const Context = React.createContext<LimitContractContext>({
  limit: () => Promise.resolve(),
  cancels: () => Promise.resolve(),
  claims: () => Promise.resolve(),
})

export const LimitContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { selectedChain } = useChainContext()

  const limit = useCallback(
    async (
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: string,
      price: string,
      postOnly: boolean,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }
      const market = await getMarket({
        chainId: selectedChain.id,
        token0: inputCurrency.address,
        token1: outputCurrency.address,
      })
      const isBid = isAddressEqual(inputCurrency.address, market.quote.address)
      try {
        const openTransaction = await openMarket({
          chainId: selectedChain.id,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
        })
        if (openTransaction) {
          setConfirmation({
            title: `Open Book`,
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await sendTransaction(walletClient, openTransaction)
        }

        const permitAmount = !isAddressEqual(inputCurrency.address, zeroAddress)
          ? parseUnits(amount, inputCurrency.decimals)
          : 0n
        const signature: PermitSignature = await permit20(
          selectedChain.id,
          walletClient,
          inputCurrency,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          permitAmount,
          getDeadlineTimestampInSeconds(),
        )
        const { transaction, result } = await limitOrder({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
          amount: amount,
          price: price,
          options: {
            signature,
            postOnly,
          },
        })

        setConfirmation({
          title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
          body: 'Please confirm in your wallet.',
          fields: [result.make, result.take]
            .filter(
              ({ amount }) =>
                parseUnits(amount, result.make.currency.decimals) > 0n,
            )
            .map(({ amount, currency, direction }) => ({
              currency,
              label: currency.symbol,
              value: toPlacesString(amount),
              direction,
            })) as Confirmation['fields'],
        })

        await sendTransaction(walletClient, transaction)
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
    [queryClient, selectedChain, setConfirmation, walletClient],
  )

  const cancels = useCallback(
    async (openOrders: OpenOrder[]) => {
      if (!walletClient || !selectedChain) {
        return
      }

      try {
        const isApprovedForAll = await fetchIsApprovedForAll(
          selectedChain.id,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
        )
        if (!isApprovedForAll) {
          await writeContract(walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
            abi: ERC721_ABI,
            functionName: 'setApprovalForAll',
            args: [
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
              true,
            ],
          })
        }

        const { transaction, result } = await cancelOrders({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          ids: openOrders.map((order) => String(order.id)),
        })

        setConfirmation({
          title: `Cancel Order`,
          body: 'Please confirm in your wallet.',
          fields: result.map(({ currency, amount, direction }) => ({
            currency,
            label: currency.symbol,
            value: toPlacesString(amount),
            direction,
          })),
        })
        await sendTransaction(walletClient, transaction)
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
    [queryClient, selectedChain, setConfirmation, walletClient],
  )

  const claims = useCallback(
    async (openOrders: OpenOrder[]) => {
      if (!walletClient || !selectedChain) {
        return
      }

      try {
        const isApprovedForAll = await fetchIsApprovedForAll(
          selectedChain.id,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
        )
        if (!isApprovedForAll) {
          await writeContract(walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
            abi: ERC721_ABI,
            functionName: 'setApprovalForAll',
            args: [
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
              true,
            ],
          })
        }

        const { transaction, result } = await claimOrders({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          ids: openOrders.map((order) => String(order.id)),
        })

        setConfirmation({
          title: `Claim Order`,
          body: 'Please confirm in your wallet.',
          fields: result.map(({ currency, amount, direction }) => ({
            currency,
            label: currency.symbol,
            value: toPlacesString(amount),
            direction,
          })),
        })
        await sendTransaction(walletClient, transaction)
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
    [queryClient, selectedChain, setConfirmation, walletClient],
  )

  return (
    <Context.Provider value={{ limit, cancels, claims }}>
      {children}
    </Context.Provider>
  )
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
