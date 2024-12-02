import React, { useEffect } from 'react'
import { useAccount, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getContractAddresses } from '@clober/v2-sdk'

import { Pool, PoolPosition } from '../../model/pool'
import { useChainContext } from '../chain-context'
import { fetchPools } from '../../apis/pools'
import { useCurrencyContext } from '../currency-context'
import { deduplicateCurrencies } from '../../utils/currency'
import { Balances } from '../../model/balances'
import { POOL_KEY_INFOS } from '../../constants/pool'

type PoolContext = {
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  currency0Amount: string
  setCurrency0Amount: (inputCurrencyAmount: string) => void
  currency1Amount: string
  setCurrency1Amount: (inputCurrencyAmount: string) => void
  disableSwap: boolean
  setDisableSwap: (value: boolean) => void
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  lpBalances: Balances
  pools: Pool[]
  poolPositions: PoolPosition[]
}

const Context = React.createContext<PoolContext>({
  lpCurrencyAmount: '',
  setLpCurrencyAmount: () => {},
  currency0Amount: '',
  setCurrency0Amount: () => {},
  currency1Amount: '',
  setCurrency1Amount: () => {},
  disableSwap: false,
  setDisableSwap: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
  lpBalances: {},
  pools: [],
  poolPositions: [],
})

export const PoolProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { address: userAddress } = useAccount()
  const { prices, setCurrencies, whitelistCurrencies } = useCurrencyContext()
  const [lpCurrencyAmount, setLpCurrencyAmount] = React.useState('')
  const [currency0Amount, setCurrency0Amount] = React.useState('')
  const [currency1Amount, setCurrency1Amount] = React.useState('')
  const [disableSwap, setDisableSwap] = React.useState(false)
  const [slippageInput, setSlippageInput] = React.useState('1')

  const { data: pools } = useQuery(
    ['pools', selectedChain],
    async () => {
      return fetchPools(selectedChain.id, prices)
    },
    {
      initialData: [],
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as {
    data: Pool[]
  }

  const { data: lpBalances } = useQuery(
    ['lp-balances', userAddress, selectedChain],
    async () => {
      if (!userAddress) {
        return {}
      }
      const results = await readContracts({
        contracts: POOL_KEY_INFOS[selectedChain.id].map(({ key }) => ({
          address: getContractAddresses({ chainId: selectedChain.id })
            .Rebalancer,
          abi: [
            {
              inputs: [
                {
                  internalType: 'address',
                  name: '',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: '',
                  type: 'uint256',
                },
              ],
              name: 'balanceOf',
              outputs: [
                {
                  internalType: 'uint256',
                  name: '',
                  type: 'uint256',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ] as const,
          functionName: 'balanceOf',
          args: [userAddress, BigInt(key)],
        })),
      })
      return results.reduce((acc: {}, { result }, index: number) => {
        return {
          ...acc,
          [POOL_KEY_INFOS[selectedChain.id][index].key]: result ?? 0n,
        }
      }, {})
    },
    {
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as {
    data: Balances
  }

  useEffect(() => {
    const action = async () => {
      setCurrencies(deduplicateCurrencies(whitelistCurrencies))
    }
    action()
  }, [setCurrencies, whitelistCurrencies])

  return (
    <Context.Provider
      value={{
        lpCurrencyAmount,
        setLpCurrencyAmount,
        currency0Amount,
        setCurrency0Amount,
        currency1Amount,
        setCurrency1Amount,
        disableSwap,
        setDisableSwap,
        slippageInput,
        setSlippageInput,
        lpBalances: lpBalances ?? {},
        pools,
        poolPositions: [],
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolContext = () => React.useContext(Context) as PoolContext
