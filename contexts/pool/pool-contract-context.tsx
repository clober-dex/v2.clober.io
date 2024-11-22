import React, { useCallback } from 'react'
import { useQueryClient, useWalletClient } from 'wagmi'
import {
  addLiquidity,
  getContractAddresses,
  getQuoteToken,
  removeLiquidity,
} from '@clober/v2-sdk'
import { isAddressEqual, zeroAddress, zeroHash } from 'viem'
import BigNumber from 'bignumber.js'

import { useChainContext } from '../chain-context'
import { useCurrencyContext } from '../currency-context'
import { Confirmation, useTransactionContext } from '../transaction-context'
import { Currency } from '../../model/currency'
import { RPC_URL } from '../../constants/rpc-urls'
import { toPlacesAmountString } from '../../utils/bignumber'
import { maxApprove } from '../../utils/approve20'
import { sendTransaction } from '../../utils/transaction'

type PoolContractContext = {
  mint: (
    currency0: Currency,
    currency1: Currency,
    amount0: string,
    amount1: string,
    disableSwap: boolean,
    slippage: number,
  ) => Promise<void>
  burn: (
    currency0: Currency,
    currency1: Currency,
    lpCurrencyAmount: string,
    slippageInput: string,
  ) => Promise<void>
}

const Context = React.createContext<PoolContractContext>({
  mint: () => Promise.resolve(),
  burn: () => Promise.resolve(),
})

export const PoolContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { selectedChain } = useChainContext()
  const { allowances, prices } = useCurrencyContext()

  const mint = useCallback(
    async (
      currency0: Currency,
      currency1: Currency,
      amount0: string,
      amount1: string,
      disableSwap: boolean,
      slippage: number,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      try {
        setConfirmation({
          title: `Add Liquidity`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })

        const spender = getContractAddresses({
          chainId: selectedChain.id,
        }).Minter
        // Max approve for currency0
        if (
          !isAddressEqual(currency0.address, zeroAddress) &&
          allowances[spender][currency0.address] === 0n
        ) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await maxApprove(walletClient, currency0, spender)
        }

        // Max approve for currency1
        if (
          !isAddressEqual(currency1.address, zeroAddress) &&
          allowances[spender][currency1.address] === 0n
        ) {
          setConfirmation({
            title: 'Approve',
            body: 'Please confirm in your wallet.',
            fields: [],
          })
          await maxApprove(walletClient, currency1, spender)
        }

        const baseCurrency = isAddressEqual(
          getQuoteToken({
            chainId: selectedChain.id,
            token0: currency0.address,
            token1: currency1.address,
          }),
          currency0.address,
        )
          ? currency1
          : currency0

        const { transaction, result } = await addLiquidity({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          token0: currency0.address,
          token1: currency1.address,
          salt: zeroHash,
          amount0,
          amount1,
          options: {
            useSubgraph: false,
            rpcUrl: RPC_URL[selectedChain.id],
            disableSwap,
            slippage,
            testnetPrice: prices[baseCurrency.address],
          },
        })

        setConfirmation({
          title: `Add Liquidity`,
          body: 'Please confirm in your wallet.',
          fields: [
            new BigNumber(result.currencyA.amount).isZero()
              ? undefined
              : {
                  direction: result.currencyA.direction,
                  currency: result.currencyA.currency,
                  label: result.currencyA.currency.symbol,
                  value: toPlacesAmountString(
                    result.currencyA.amount,
                    prices[result.currencyA.currency.address],
                  ),
                },
            new BigNumber(result.currencyB.amount).isZero()
              ? undefined
              : {
                  direction: result.currencyB.direction,
                  currency: result.currencyB.currency,
                  label: result.currencyB.currency.symbol,
                  value: toPlacesAmountString(
                    result.currencyB.amount,
                    prices[result.currencyB.currency.address],
                  ),
                },
            new BigNumber(result.lpCurrency.amount).isZero()
              ? undefined
              : {
                  direction: result.lpCurrency.direction,
                  currency: result.lpCurrency.currency,
                  label: result.lpCurrency.currency.symbol,
                  value: toPlacesAmountString(
                    result.lpCurrency.amount,
                    prices[baseCurrency.address],
                  ),
                },
          ].filter((field) => field !== undefined) as Confirmation['fields'],
        })
        if (transaction) {
          await sendTransaction(walletClient, transaction)
        }
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['balances']),
          queryClient.invalidateQueries(['allowances']),
          queryClient.invalidateQueries(['pools']),
          queryClient.invalidateQueries(['lp-balances']),
        ])
        setConfirmation(undefined)
      }
    },
    [
      allowances,
      prices,
      queryClient,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const burn = useCallback(
    async (
      currency0: Currency,
      currency1: Currency,
      lpCurrencyAmount: string,
      slippageInput: string,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      try {
        setConfirmation({
          title: `Remove Liquidity`,
          body: 'Please confirm in your wallet.',
          fields: [],
        })

        const baseCurrency = isAddressEqual(
          getQuoteToken({
            chainId: selectedChain.id,
            token0: currency0.address,
            token1: currency1.address,
          }),
          currency0.address,
        )
          ? currency1
          : currency0

        const { result, transaction } = await removeLiquidity({
          chainId: selectedChain.id,
          userAddress: walletClient.account.address,
          token0: currency0.address,
          token1: currency1.address,
          salt: zeroHash,
          amount: lpCurrencyAmount,
          options: {
            useSubgraph: false,
            rpcUrl: RPC_URL[selectedChain.id],
            slippage: Number(slippageInput),
          },
        })

        setConfirmation({
          title: `Remove Liquidity`,
          body: 'Please confirm in your wallet.',
          fields: [
            new BigNumber(result.currencyA.amount).isZero()
              ? undefined
              : {
                  direction: result.currencyA.direction,
                  currency: result.currencyA.currency,
                  label: result.currencyA.currency.symbol,
                  value: toPlacesAmountString(
                    result.currencyA.amount,
                    prices[result.currencyA.currency.address],
                  ),
                },
            new BigNumber(result.currencyB.amount).isZero()
              ? undefined
              : {
                  direction: result.currencyB.direction,
                  currency: result.currencyB.currency,
                  label: result.currencyB.currency.symbol,
                  value: toPlacesAmountString(
                    result.currencyB.amount,
                    prices[result.currencyB.currency.address],
                  ),
                },
            new BigNumber(result.lpCurrency.amount).isZero()
              ? undefined
              : {
                  direction: result.lpCurrency.direction,
                  currency: result.lpCurrency.currency,
                  label: result.lpCurrency.currency.symbol,
                  value: toPlacesAmountString(
                    result.lpCurrency.amount,
                    prices[baseCurrency.address],
                  ),
                },
          ].filter((field) => field !== undefined) as Confirmation['fields'],
        })

        if (transaction) {
          await sendTransaction(walletClient, transaction)
        }
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['balances']),
          queryClient.invalidateQueries(['pools']),
          queryClient.invalidateQueries(['lp-balances']),
        ])
        setConfirmation(undefined)
      }
    },
    [prices, queryClient, selectedChain, setConfirmation, walletClient],
  )

  return (
    <Context.Provider
      value={{
        mint,
        burn,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolContractContext = () =>
  React.useContext(Context) as PoolContractContext
