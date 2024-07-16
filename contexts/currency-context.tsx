import React, { useState } from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { readContracts } from '@wagmi/core'
import { getContractAddresses } from '@clober/v2-sdk'

import { Currency } from '../model/currency'
import { Prices } from '../model/prices'
import { Balances } from '../model/balances'
import { fetchWhitelistCurrencies } from '../apis/currencies'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { fetchPrices } from '../apis/swap/prices'
import { AGGREGATORS } from '../constants/aggregators'
import { Allowances } from '../model/allowances'

import { useChainContext } from './chain-context'

type CurrencyContext = {
  whitelistCurrencies: Currency[]
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  prices: Prices
  balances: Balances
  allowances: Allowances
  isOpenOrderApproved: boolean
}

const Context = React.createContext<CurrencyContext>({
  whitelistCurrencies: [],
  currencies: [],
  setCurrencies: () => {},
  prices: {},
  balances: {},
  allowances: {},
  isOpenOrderApproved: false,
})

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const CurrencyProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress, watch: true })
  const { selectedChain } = useChainContext()
  const { data: whitelistCurrencies } = useQuery(
    ['currencies', selectedChain],
    async () => {
      return fetchWhitelistCurrencies(selectedChain.id)
    },
    {
      initialData: [],
    },
  ) as {
    data: Currency[]
  }
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const { data: balances } = useQuery(
    ['balances', userAddress, balance, selectedChain, currencies],
    async () => {
      if (!userAddress) {
        return {}
      }
      const uniqueCurrencies = currencies
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
        )
        .filter((currency) => !isAddressEqual(currency.address, zeroAddress))
      const results = await readContracts({
        contracts: uniqueCurrencies.map((currency) => ({
          address: currency.address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        })),
      })
      return results.reduce(
        (acc: {}, { result }, index: number) => {
          const currency = uniqueCurrencies[index]
          return {
            ...acc,
            [getAddress(currency.address)]: result ?? 0n,
          }
        },
        {
          [zeroAddress]: balance?.value ?? 0n,
        },
      )
    },
    {
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as {
    data: Balances
  }

  const { data: prices } = useQuery(
    ['prices', selectedChain],
    async () => {
      return fetchPrices(AGGREGATORS[selectedChain.id])
    },
    {
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  )

  const { data } = useQuery(
    ['allowances', userAddress, selectedChain, currencies],
    async () => {
      const spenders: `0x${string}`[] = [
        getContractAddresses({ chainId: selectedChain.id }).Controller,
        ...AGGREGATORS[selectedChain.id].map(
          (aggregator) => aggregator.contract,
        ),
      ]
      if (!userAddress) {
        return {
          allowances: {},
          isOpenOrderApproved: false,
        }
      }
      const contracts = [
        ...spenders
          .map((spender) => {
            return currencies.map((currency) => ({
              address: currency.address,
              abi: ERC20_PERMIT_ABI,
              functionName: 'allowance',
              args: [userAddress, spender],
            }))
          }, [])
          .flat(),
        {
          address: getContractAddresses({ chainId: selectedChain.id })
            .BookManager,
          abi: _abi,
          functionName: 'isApprovedForAll',
          args: [
            userAddress,
            getContractAddresses({ chainId: selectedChain.id }).Controller,
          ],
        },
      ]
      const results = await readContracts({
        contracts,
      })
      return {
        isOpenOrderApproved: results.slice(-1)?.[0]?.result ?? false,
        allowances: results.slice(0, -1).reduce(
          (
            acc: {
              [key in `0x${string}`]: { [key in `0x${string}`]: bigint }
            },
            { result },
            i,
          ) => {
            const currency = currencies[i % currencies.length]
            const spender = getAddress(
              spenders[Math.floor(i / currencies.length)],
            )
            const resultValue = (result ?? 0n) as bigint
            return {
              ...acc,
              [spender]: {
                ...acc[spender],
                [getAddress(currency.address)]: resultValue,
              },
            }
          },
          spenders.reduce((acc, spender) => ({ ...acc, [spender]: {} }), {}),
        ),
      }
    },
    {
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as {
    data: { allowances: Allowances; isOpenOrderApproved: boolean }
  }

  return (
    <Context.Provider
      value={{
        whitelistCurrencies,
        prices: prices ?? {},
        balances: balances ?? {},
        allowances: data?.allowances ?? {},
        isOpenOrderApproved: data?.isOpenOrderApproved ?? false,
        currencies,
        setCurrencies,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useCurrencyContext = () =>
  React.useContext(Context) as CurrencyContext
