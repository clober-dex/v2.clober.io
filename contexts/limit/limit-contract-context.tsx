import React, { useCallback } from 'react'
import { useQueryClient, useWalletClient } from 'wagmi'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import {
  cancelOrders,
  claimOrders,
  getContractAddresses,
  limitOrder,
  openMarket,
  OpenOrder,
  setApprovalOfOpenOrdersForAll,
} from '@clober/v2-sdk'

import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'
import { Confirmation, useTransactionContext } from '../transaction-context'
import { toPlacesString } from '../../utils/bignumber'
import { sendTransaction, waitTransaction } from '../../utils/transaction'
import { RPC_URL } from '../../constants/rpc-urls'
import { LOCAL_STORAGE_IS_OPENED } from '../../utils/market'
import { useCurrencyContext } from '../currency-context'
import { maxApprove } from '../../utils/approve20'

type LimitContractContext = {
  limit: (
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: string,
    price: string,
    postOnly: boolean,
    isBid: boolean,
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
  const { isOpenOrderApproved, allowances } = useCurrencyContext()

  const limit = useCallback(
    async (
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: string,
      price: string,
      postOnly: boolean,
      isBid: boolean,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const cachedIsOpened = localStorage.getItem(
        LOCAL_STORAGE_IS_OPENED(
          'market',
          selectedChain,
          [
            getAddress(inputCurrency.address),
            getAddress(outputCurrency.address),
          ],
          isBid,
        ),
      )
      try {
        if (cachedIsOpened !== 'open') {
          setConfirmation({
            title: `Checking Book Availability`,
            body: '',
            fields: [],
          })
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
        }

        setConfirmation({
          title: `Place Order`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })

        const spender = getContractAddresses({
          chainId: selectedChain.id,
        }).Controller
        if (
          !isAddressEqual(inputCurrency.address, zeroAddress) &&
          allowances[spender][inputCurrency.address] === 0n
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
          await maxApprove(walletClient, inputCurrency, spender)
          await queryClient.invalidateQueries(['allowances'])
        }
        const args = {
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
          amount: amount,
          price: price,
          options: {
            postOnly,
            rpcUrl: RPC_URL[selectedChain.id],
            roundingDownTakenBid: true,
            roundingDownMakeAsk: true,
          },
        }
        const { transaction, result } = await limitOrder(args)
        console.log('limitOrder request: ', args)
        console.log('limitOrder result: ', result)

        if (Number(result.spent.amount) === 0) {
          setConfirmation({
            title: `Place Order`,
            body: 'Please confirm in your wallet.',
            fields: [
              {
                direction: result.make.direction,
                currency: result.make.currency,
                label: result.make.currency.symbol,
                value: toPlacesString(result.make.amount),
              },
            ] as Confirmation['fields'],
          })
        } else {
          setConfirmation({
            title: `Place Order`,
            body: 'Please confirm in your wallet.',
            fields: [
              {
                direction: result.make.direction,
                currency: result.make.currency,
                label: result.make.currency.symbol,
                value: toPlacesString(
                  Number(result.make.amount) + Number(result.spent.amount),
                ),
              },
              {
                direction: result.taken.direction,
                currency: result.taken.currency,
                label: result.taken.currency.symbol,
                value: toPlacesString(result.taken.amount),
              },
            ] as Confirmation['fields'],
          })
        }
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
    [allowances, queryClient, selectedChain, setConfirmation, walletClient],
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
        if (!isOpenOrderApproved) {
          const hash = await setApprovalOfOpenOrdersForAll({
            chainId: walletClient.chain.id,
            walletClient: walletClient as any,
            options: {
              rpcUrl: RPC_URL[walletClient.chain.id],
            },
          })
          if (hash) {
            await waitTransaction(walletClient.chain.id, hash)
            await queryClient.invalidateQueries(['allowances'])
          }
        }

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
    [
      isOpenOrderApproved,
      queryClient,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
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
        if (!isOpenOrderApproved) {
          const hash = await setApprovalOfOpenOrdersForAll({
            chainId: walletClient.chain.id,
            walletClient: walletClient as any,
            options: {
              rpcUrl: RPC_URL[walletClient.chain.id],
            },
          })
          if (hash) {
            await waitTransaction(walletClient.chain.id, hash)
            await queryClient.invalidateQueries(['allowances'])
          }
        }

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
    [
      isOpenOrderApproved,
      queryClient,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  return (
    <Context.Provider value={{ limit, cancels, claims }}>
      {children}
    </Context.Provider>
  )
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
