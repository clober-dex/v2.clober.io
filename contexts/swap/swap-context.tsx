import React, { useCallback, useEffect, useState } from 'react'
import { getAddress, isAddressEqual } from 'viem'

import { Currency } from '../../model/currency'
import { useChainContext } from '../chain-context'
import {
  deduplicateCurrencies,
  fetchCurrenciesDone,
  fetchCurrency,
  LOCAL_STORAGE_INPUT_CURRENCY_KEY,
  LOCAL_STORAGE_OUTPUT_CURRENCY_KEY,
} from '../../utils/currency'
import { getQueryParams, setQueryParams } from '../../utils/url'
import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
} from '../../constants/currency'
import { useCurrencyContext } from '../currency-context'

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

export const SwapProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { whitelistCurrencies, setCurrencies } = useCurrencyContext()
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
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('swap', selectedChain),
          currency.address,
        )
        setQueryParams({
          inputCurrency: currency.address,
        })
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('swap', selectedChain),
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
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('swap', selectedChain),
          currency.address,
        )
        setQueryParams({
          outputCurrency: currency.address,
        })
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('swap', selectedChain),
        )
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  useEffect(
    () => {
      if (!fetchCurrenciesDone(whitelistCurrencies, selectedChain)) {
        setInputCurrency(DEFAULT_INPUT_CURRENCY[selectedChain.id])
        setOutputCurrency(DEFAULT_OUTPUT_CURRENCY[selectedChain.id])
        return
      }

      const action = async () => {
        const inputCurrencyAddress =
          getQueryParams()?.inputCurrency ??
          localStorage.getItem(
            LOCAL_STORAGE_INPUT_CURRENCY_KEY('swap', selectedChain),
          )
        const outputCurrencyAddress =
          getQueryParams()?.outputCurrency ??
          localStorage.getItem(
            LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('swap', selectedChain),
          )

        const _inputCurrency = inputCurrencyAddress
          ? whitelistCurrencies.find((currency) =>
              isAddressEqual(
                currency.address,
                getAddress(inputCurrencyAddress),
              ),
            ) ??
            (await fetchCurrency(
              selectedChain.id,
              getAddress(inputCurrencyAddress),
            ))
          : DEFAULT_INPUT_CURRENCY[selectedChain.id]
        const _outputCurrency = outputCurrencyAddress
          ? whitelistCurrencies.find((currency) =>
              isAddressEqual(
                currency.address,
                getAddress(outputCurrencyAddress),
              ),
            ) ??
            (await fetchCurrency(
              selectedChain.id,
              getAddress(outputCurrencyAddress),
            ))
          : DEFAULT_OUTPUT_CURRENCY[selectedChain.id]

        setCurrencies(
          deduplicateCurrencies(
            [...whitelistCurrencies].concat(
              _inputCurrency ? [_inputCurrency] : [],
              _outputCurrency ? [_outputCurrency] : [],
            ),
          ),
        )
        setInputCurrency(_inputCurrency)
        setOutputCurrency(_outputCurrency)
      }
      if (window.location.href.includes('/swap')) {
        action()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedChain,
      setCurrencies,
      setInputCurrency,
      setOutputCurrency,
      whitelistCurrencies,
      window.location.href,
    ],
  )

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
