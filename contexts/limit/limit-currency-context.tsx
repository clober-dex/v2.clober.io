import React from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { Balances } from '../../model/balances'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'
import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'

import { useMarketContext } from './market-context'

type LimitCurrencyContext = {
  balances: Balances
  currencies: Currency[]
}

const Context = React.createContext<LimitCurrencyContext>({
  balances: {},
  currencies: [],
})

export const LimitCurrencyProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress, watch: true })
  const { markets } = useMarketContext()

  const { data: balances } = useQuery(
    ['limit-balances', userAddress, balance, markets, selectedChain],
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
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as { data: Balances }

  return (
    <Context.Provider
      value={{
        balances: balances ?? {},
        currencies: [],
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLimitCurrencyContext = () =>
  React.useContext(Context) as LimitCurrencyContext
