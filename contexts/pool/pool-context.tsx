import React, { useEffect } from 'react'
import { useQuery } from 'wagmi'

import { Pool, PoolPosition } from '../../model/pool'
import { useChainContext } from '../chain-context'
import { fetchPools } from '../../apis/pools'
import { useCurrencyContext } from '../currency-context'
import { deduplicateCurrencies } from '../../utils/currency'

type PoolContext = {
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  currency0Amount: string
  setCurrency0Amount: (inputCurrencyAmount: string) => void
  currency1Amount: string
  setCurrency1Amount: (inputCurrencyAmount: string) => void
  asRatio: boolean
  setAsRatio: (asRatio: boolean) => void
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
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
  asRatio: false,
  setAsRatio: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
  pools: [],
  poolPositions: [],
})

export const PoolProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { prices, setCurrencies, whitelistCurrencies } = useCurrencyContext()
  const [lpCurrencyAmount, setLpCurrencyAmount] = React.useState('')
  const [currency0Amount, setCurrency0Amount] = React.useState('')
  const [currency1Amount, setCurrency1Amount] = React.useState('')
  const [asRatio, setAsRatio] = React.useState(false)
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
        asRatio,
        setAsRatio,
        slippageInput,
        setSlippageInput,
        pools,
        poolPositions: [],
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolContext = () => React.useContext(Context) as PoolContext
