import React from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { Balances } from '../../model/balances'
import { Currency } from '../../model/currency'
import { Prices } from '../../model/prices'
import { fetchCurrencies } from '../../apis/swap/currencies'
import { AGGREGATORS } from '../../constants/aggregators'
import { CHAIN_IDS } from '../../constants/chain'
import { fetchPrices } from '../../apis/swap/prices'
import { useChainContext } from '../chain-context'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'

type SwapCurrencyContext = {
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  prices: Prices
  balances: Balances
}

const Context = React.createContext<SwapCurrencyContext>({
  currencies: [],
  setCurrencies: () => {},
  prices: {},
  balances: {},
})

export const SwapCurrencyProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({
    address: userAddress,
    watch: true,
  })
  const { selectedChain } = useChainContext()

  const { data: _currencies } = useQuery(
    ['swap-currencies', selectedChain],
    async () => fetchCurrencies(AGGREGATORS[selectedChain.id as CHAIN_IDS]),
  )
  const [currencies, setCurrencies] = React.useState<Currency[] | undefined>(
    _currencies,
  )

  const { data: prices } = useQuery(
    ['swap-prices', selectedChain],
    async () => {
      return fetchPrices(AGGREGATORS[selectedChain.id as CHAIN_IDS])
    },
    {
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  )

  const { data: balances } = useQuery(
    ['swap-balances', userAddress, balance, currencies],
    async () => {
      if (!userAddress || !currencies) {
        return {}
      }
      const uniqueCurrencies = currencies
        .filter((currency) => !isAddressEqual(currency.address, zeroAddress))
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
        )
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
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as { data: Balances }

  return (
    <Context.Provider
      value={{
        currencies: currencies ?? [],
        setCurrencies,
        prices: prices ?? {},
        balances: balances ?? {},
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useSwapCurrencyContext = () =>
  React.useContext(Context) as SwapCurrencyContext
