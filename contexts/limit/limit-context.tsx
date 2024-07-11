import React, { useCallback, useEffect, useState } from 'react'
import { getAddress, isAddressEqual } from 'viem'
import { getQuoteToken } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { useChainContext } from '../chain-context'
import {
  deduplicateCurrencies,
  fetchCurrenciesDone,
  fetchCurrency,
  LOCAL_STORAGE_INPUT_CURRENCY_KEY,
  LOCAL_STORAGE_OUTPUT_CURRENCY_KEY,
} from '../../utils/currency'
import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
} from '../../constants/currency'
import { setQueryParams } from '../../utils/url'
import { useCurrencyContext } from '../currency-context'

type LimitContext = {
  isBid: boolean
  setIsBid: (isBid: (prevState: boolean) => boolean) => void
  showInputCurrencySelect: boolean
  setShowInputCurrencySelect: (showInputCurrencySelect: boolean) => void
  inputCurrency: Currency | undefined
  setInputCurrency: (currency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (amount: string) => void
  showOutputCurrencySelect: boolean
  setShowOutputCurrencySelect: (showOutputCurrencySelect: boolean) => void
  outputCurrency: Currency | undefined
  setOutputCurrency: (currency: Currency | undefined) => void
  outputCurrencyAmount: string
  setOutputCurrencyAmount: (amount: string) => void
  isPostOnly: boolean
  setIsPostOnly: (isPostOnly: (prevState: boolean) => boolean) => void
  priceInput: string
  setPriceInput: (priceInput: string) => void
}

const Context = React.createContext<LimitContext>({
  isBid: true,
  setIsBid: () => {},
  showInputCurrencySelect: false,
  setShowInputCurrencySelect: () => {},
  inputCurrency: undefined,
  setInputCurrency: () => {},
  inputCurrencyAmount: '',
  setInputCurrencyAmount: () => {},
  showOutputCurrencySelect: false,
  setShowOutputCurrencySelect: () => {},
  outputCurrency: undefined,
  setOutputCurrency: () => {},
  outputCurrencyAmount: '',
  setOutputCurrencyAmount: () => {},
  isPostOnly: false,
  setIsPostOnly: () => {},
  priceInput: '',
  setPriceInput: () => {},
})

export const LimitProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { whitelistCurrencies, setCurrencies } = useCurrencyContext()

  const [isBid, setIsBid] = useState(true)

  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [inputCurrency, _setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')

  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [outputCurrency, _setOutputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [outputCurrencyAmount, setOutputCurrencyAmount] = useState('')

  const [isPostOnly, setIsPostOnly] = useState(false)
  const [priceInput, setPriceInput] = useState('')

  const setInputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('limit', selectedChain),
          currency.address,
        )
        setQueryParams({
          inputCurrency: currency.address,
        })
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('limit', selectedChain),
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
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('limit', selectedChain),
          currency.address,
        )
        setQueryParams({
          outputCurrency: currency.address,
        })
      } else {
        localStorage.removeItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('limit', selectedChain),
        )
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  useEffect(() => {
    if (!fetchCurrenciesDone(whitelistCurrencies, selectedChain)) {
      setInputCurrency(DEFAULT_INPUT_CURRENCY[selectedChain.id])
      setOutputCurrency(DEFAULT_OUTPUT_CURRENCY[selectedChain.id])
      return
    }

    const action = async () => {
      const inputCurrencyAddress = localStorage.getItem(
        LOCAL_STORAGE_INPUT_CURRENCY_KEY('limit', selectedChain),
      )
      const outputCurrencyAddress = localStorage.getItem(
        LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('limit', selectedChain),
      )

      const _inputCurrency = inputCurrencyAddress
        ? whitelistCurrencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(inputCurrencyAddress),
          ))
        : DEFAULT_INPUT_CURRENCY[selectedChain.id]
      const _outputCurrency = outputCurrencyAddress
        ? whitelistCurrencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
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

      if (_inputCurrency && _outputCurrency) {
        const quote = getQuoteToken({
          chainId: selectedChain.id,
          token0: _inputCurrency.address,
          token1: _outputCurrency.address,
        })
        if (isAddressEqual(quote, _inputCurrency.address)) {
          setIsBid(true)
        } else {
          setIsBid(false)
        }
      } else {
        setIsBid(true)
      }
    }
    action()
  }, [
    selectedChain,
    setCurrencies,
    setInputCurrency,
    setOutputCurrency,
    whitelistCurrencies,
  ])

  return (
    <Context.Provider
      value={{
        isBid,
        setIsBid,
        showInputCurrencySelect,
        setShowInputCurrencySelect,
        inputCurrency,
        setInputCurrency,
        inputCurrencyAmount,
        setInputCurrencyAmount,
        showOutputCurrencySelect,
        setShowOutputCurrencySelect,
        outputCurrency,
        setOutputCurrency,
        outputCurrencyAmount,
        setOutputCurrencyAmount,
        isPostOnly,
        setIsPostOnly,
        priceInput,
        setPriceInput,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLimitContext = () => React.useContext(Context) as LimitContext
