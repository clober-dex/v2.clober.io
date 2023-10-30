import React from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getAddress } from 'viem'

import { Balances } from '../model/balances'
import { Currency } from '../model/currency'
import { IERC20__factory } from '../typechain'

import { useMarketContext } from './market-context'

type CurrencyContext = {
  balances: Balances
}

const Context = React.createContext<CurrencyContext>({
  balances: {},
})

export const isEthereum = (currency: Currency) => {
  return [
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    '0x4284186b053ACdBA28E8B26E99475d891533086a',
  ]
    .map((address) => getAddress(address))
    .includes(getAddress(currency.address))
}

export const CurrencyProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress })
  const { markets } = useMarketContext()

  const { data: balances } = useQuery(
    ['balances', userAddress, balance, markets],
    async () => {
      if (!userAddress) {
        return {}
      }
      const currencies = [
        ...markets.map((market) => market.quoteToken),
        ...markets.map((market) => market.baseToken),
      ].filter(
        (currency, index, self) =>
          self.findIndex((c) => c.address === currency.address) === index,
      )
      const results = await readContracts({
        contracts: currencies.map((currency) => ({
          address: currency.address,
          abi: IERC20__factory.abi,
          functionName: 'balanceOf',
          args: [userAddress],
        })),
      })
      return results.reduce((acc: {}, { result }, index: number) => {
        const currency = currencies[index]
        return {
          ...acc,
          [currency.address]: isEthereum(currency)
            ? (result ?? 0n) + (balance?.value ?? 0n)
            : result,
        }
      }, {})
    },
    {
      refetchInterval: 2000,
      refetchOnWindowFocus: true,
    },
  )

  return (
    <Context.Provider
      value={{
        balances: balances ?? {},
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useCurrencyContext = () =>
  React.useContext(Context) as CurrencyContext