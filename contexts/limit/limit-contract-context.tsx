import React, { useCallback } from 'react'
import { useQueryClient, useWalletClient } from 'wagmi'
import { isAddressEqual, parseUnits, zeroAddress } from 'viem'
import {
  cancelOrders,
  claimOrders,
  CurrencyFlow,
  limitOrder,
  openMarket,
  OpenOrder,
  signERC20Permit,
} from '@clober/v2-sdk'
import BigNumber from 'bignumber.js'

import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'
import { Confirmation, useTransactionContext } from '../transaction-context'
import { toPlacesString } from '../../utils/bignumber'
import {
  approve20,
  sendTransaction,
  setApprovalOfOpenOrdersForAll,
} from '../../utils/wallet'
import { RPC_URL } from '../../constants/rpc-urls'

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
      setConfirmation({
        title: `Checking Book Availability`,
        body: '',
        fields: [],
      })
      try {
        const openTransaction = await openMarket({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
          options: {
            rpcUrl: RPC_URL[selectedChain.id],
          },
        })
        if (openTransaction) {
          setConfirmation({
            title: `Open Book`,
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await sendTransaction(walletClient, openTransaction)
        }

        setConfirmation({
          title: `Place Order`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })

        const erc20PermitParam = await signERC20Permit({
          chainId: selectedChain.id,
          walletClient: walletClient as any,
          token: inputCurrency.address,
          amount: !isAddressEqual(inputCurrency.address, zeroAddress)
            ? amount
            : '0',
          options: {
            rpcUrl: RPC_URL[selectedChain.id],
          },
        })
        if (
          erc20PermitParam === undefined &&
          !isAddressEqual(inputCurrency.address, zeroAddress)
        ) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [
              {
                currency: inputCurrency,
                label: inputCurrency.symbol,
                value: amount,
              },
            ],
          })
          await approve20(walletClient, inputCurrency, amount)
        }
        const { transaction, result } = await limitOrder({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
          amount: amount,
          price: price,
          options: {
            erc20PermitParam,
            postOnly,
            rpcUrl: RPC_URL[selectedChain.id],
            roundingDownTakenBid: true,
            roundingDownMakeAsk: true,
          },
        })
        console.log('limitOrder result: ', result)

        setConfirmation({
          title: `Place Order`,
          body: 'Please confirm in your wallet.',
          fields: [result.make, result.taken, result.spent]
            .reduce((acc, currencyFlow) => {
              const index = acc.findIndex(
                (cf) =>
                  cf.currency.address === currencyFlow.currency.address &&
                  cf.direction === currencyFlow.direction,
              )
              if (index === -1) {
                acc.push(currencyFlow)
              } else {
                acc[index].amount = new BigNumber(acc[index].amount)
                  .plus(currencyFlow.amount)
                  .toString()
              }
              return acc
            }, [] as CurrencyFlow[])
            .filter(
              ({ amount, currency }) =>
                parseUnits(amount, currency.decimals) > 0n,
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
        setConfirmation({
          title: `Cancel Order`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })
        await setApprovalOfOpenOrdersForAll(walletClient)

        const { transaction, result } = await cancelOrders({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          ids: openOrders.map((order) => String(order.id)),
          options: {
            rpcUrl: RPC_URL[selectedChain.id],
          },
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
        setConfirmation({
          title: `Claim Order`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })
        await setApprovalOfOpenOrdersForAll(walletClient)

        const { transaction, result } = await claimOrders({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          ids: openOrders.map((order) => String(order.id)),
          options: {
            rpcUrl: RPC_URL[selectedChain.id],
          },
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
