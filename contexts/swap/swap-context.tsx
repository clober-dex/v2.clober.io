import React, { useCallback, useEffect, useState } from 'react'
import { getAddress, isAddressEqual } from 'viem'

import { Currency } from '../../model/currency'
import { useChainContext } from '../chain-context'
import { Chain } from '../../model/chain'

import { useSwapCurrencyContext } from './swap-currency-context'

type SwapContext = {
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
  inputCurrency: undefined,
  setInputCurrency: () => {},
  inputCurrencyAmount: '',
  setInputCurrencyAmount: () => {},
  outputCurrency: undefined,
  setOutputCurrency: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
})

const LOCAL_STORAGE_INPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-inputCurrency-swap`
const LOCAL_STORAGE_OUTPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-outputCurrency-swap`
const QUERY_PARAM_INPUT_CURRENCY_KEY = 'inputCurrency'
const QUERY_PARAM_OUTPUT_CURRENCY_KEY = 'outputCurrency'

export const SwapProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { currencies } = useSwapCurrencyContext()

  const [inputCurrency, _setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')
  const [outputCurrency, _setOutputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [slippageInput, setSlippageInput] = useState('1')

  const setInputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY(selectedChain),
          currency.address,
        )
      }
      _setInputCurrency(currency)
    },
    [selectedChain],
  )

  const setOutputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY(selectedChain),
          currency.address,
        )
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  useEffect(() => {
    setInputCurrency(undefined)
    setInputCurrencyAmount('')
    setOutputCurrency(undefined)
  }, [selectedChain, setInputCurrency, setOutputCurrency])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryParamInputCurrencyAddress = params.get(
      QUERY_PARAM_INPUT_CURRENCY_KEY,
    )
    const queryParamOutputCurrencyAddress = params.get(
      QUERY_PARAM_OUTPUT_CURRENCY_KEY,
    )
    const localStorageInputCurrencyAddress = localStorage.getItem(
      LOCAL_STORAGE_INPUT_CURRENCY_KEY(selectedChain),
    )
    const localStorageOutputCurrencyAddress = localStorage.getItem(
      LOCAL_STORAGE_OUTPUT_CURRENCY_KEY(selectedChain),
    )
    const inputCurrencyAddress =
      queryParamInputCurrencyAddress ||
      localStorageInputCurrencyAddress ||
      undefined
    const outputCurrencyAddress =
      queryParamOutputCurrencyAddress ||
      localStorageOutputCurrencyAddress ||
      undefined
    setInputCurrency(
      inputCurrencyAddress
        ? currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          )
        : undefined,
    )
    setOutputCurrency(
      outputCurrencyAddress
        ? currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
          )
        : undefined,
    )
  }, [selectedChain, currencies, setInputCurrency, setOutputCurrency])

  return (
    <Context.Provider
      value={{
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
