import React, { useCallback, useEffect, useState } from 'react'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { Balances } from '../../model/balances'
import { Currency } from '../../model/currency'
import { Prices } from '../../model/prices'
import { fetchCurrencies } from '../../apis/swap/currencies'
import { AGGREGATORS } from '../../constants/aggregators'
import { fetchPrices } from '../../apis/swap/prices'
import { useChainContext } from '../chain-context'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'
import {
  fetchCurrency,
  getCurrencyAddress,
  LOCAL_STORAGE_INPUT_CURRENCY_KEY,
  LOCAL_STORAGE_OUTPUT_CURRENCY_KEY,
} from '../../utils/currency'
import { setQueryParams } from '../../utils/url'
import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
} from '../../constants/currency'

type SwapContext = {
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  prices: Prices
  balances: Balances
  inputCurrency: Currency | undefined
  setInputCurrency: (currency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (amount: string) => void
  outputCurrency: Currency | undefined
  setOutputCurrency: (currency: Currency | undefined) => void
  slippageInput: string
  setSlippageInput: (slippage: string) => void
}

const Context = React.createContext<SwapContext>({
  currencies: [],
  setCurrencies: () => {},
  prices: {},
  balances: {},
  inputCurrency: undefined,
  setInputCurrency: () => {},
  inputCurrencyAmount: '',
  setInputCurrencyAmount: () => {},
  outputCurrency: undefined,
  setOutputCurrency: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
})

export const SwapProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({
    address: userAddress,
    watch: true,
  })
  const { selectedChain } = useChainContext()
  const [inputCurrency, _setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')
  const [outputCurrency, _setOutputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [slippageInput, setSlippageInput] = useState('1')

  const { inputCurrencyAddress, outputCurrencyAddress } = getCurrencyAddress(
    'swap',
    selectedChain,
  )
  const { data: _currencies } = useQuery(
    ['swap-currencies', selectedChain],
    async () => {
      const _currencies = await fetchCurrencies(AGGREGATORS[selectedChain.id])
      const _inputCurrency = inputCurrencyAddress
        ? _currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(inputCurrencyAddress),
          ))
        : undefined
      const _outputCurrency = outputCurrencyAddress
        ? _currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(outputCurrencyAddress),
          ))
        : undefined
      return [..._currencies]
        .concat(
          _inputCurrency ? [_inputCurrency] : [],
          _outputCurrency ? [_outputCurrency] : [],
        )
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
        )
    },
    {
      initialData: [],
    },
  ) as {
    data: Currency[]
  }
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const { data: prices } = useQuery(
    ['swap-prices', selectedChain],
    async () => {
      return fetchPrices(AGGREGATORS[selectedChain.id])
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

  const setInputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('swap', selectedChain),
          currency.address,
        )
        setQueryParams({
          inputCurrency: currency.address,
        })
      }
      _setInputCurrency(currency)
    },
    [selectedChain],
  )

  const setOutputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('swap', selectedChain),
          currency.address,
        )
        setQueryParams({
          outputCurrency: currency.address,
        })
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  useEffect(() => {
    setCurrencies(_currencies)

    const inputCurrency = inputCurrencyAddress
      ? _currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
        )
      : DEFAULT_INPUT_CURRENCY[selectedChain.id]
    const outputCurrency = outputCurrencyAddress
      ? _currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
        )
      : DEFAULT_OUTPUT_CURRENCY[selectedChain.id]

    setInputCurrency(inputCurrency)
    setOutputCurrency(outputCurrency)
  }, [
    _currencies,
    inputCurrencyAddress,
    outputCurrencyAddress,
    selectedChain,
    setInputCurrency,
    setOutputCurrency,
  ])

  return (
    <Context.Provider
      value={{
        currencies: currencies ?? [],
        setCurrencies,
        prices: prices ?? {},
        balances: balances ?? {},
        inputCurrency,
        setInputCurrency,
        inputCurrencyAmount,
        setInputCurrencyAmount,
        outputCurrency,
        setOutputCurrency,
        slippageInput,
        setSlippageInput,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useSwapContext = () => React.useContext(Context) as SwapContext
