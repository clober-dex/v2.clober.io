import React, { useMemo } from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { Balances } from '../../model/balances'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'
import { Currency } from '../../model/currency'

import { useMarketContext } from './market-context'

type LimitCurrencyContext = {
  currencies: Currency[]
  balances: Balances
}

const Context = React.createContext<LimitCurrencyContext>({
  currencies: [],
  balances: {},
})

export const LimitCurrencyProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress })
  const { markets } = useMarketContext()

  const { data: balances } = useQuery(
    ['limit-balances', userAddress, balance, markets],
    async () => {
      if (!userAddress) {
        return {}
      }
      const uniqueCurrencies = [
        ...markets.map((market) => market.quote),
        ...markets.map((market) => market.base),
      ]
        .filter(
          (currency, index, self) =>
            self.findIndex((c) => c.address === currency.address) === index,
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
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as { data: Balances }

  const currencies = useMemo(() => {
    return [
      ...markets.map((market) => market.quote),
      ...markets.map((market) => market.base),
    ]
  }, [markets])

  return (
    <Context.Provider
      value={{
        currencies,
        balances: balances ?? {},
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLimitCurrencyContext = () =>
  React.useContext(Context) as LimitCurrencyContext
