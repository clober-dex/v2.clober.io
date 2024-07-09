import React, { useState } from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { readContracts } from '@wagmi/core'

import { Currency } from '../model/currency'
import { Prices } from '../model/prices'
import { Balances } from '../model/balances'
import { fetchWhitelistCurrencies } from '../apis/currencies'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { fetchPrices } from '../apis/swap/prices'
import { AGGREGATORS } from '../constants/aggregators'

import { useChainContext } from './chain-context'

type CurrencyContext = {
  whitelistCurrencies: Currency[]
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  prices: Prices
  balances: Balances
}

const Context = React.createContext<CurrencyContext>({
  whitelistCurrencies: [],
  currencies: [],
  setCurrencies: () => {},
  prices: {},
  balances: {},
})

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

  return (
    <Context.Provider
      value={{
        whitelistCurrencies,
        prices: prices ?? {},
        balances: balances ?? {},
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
