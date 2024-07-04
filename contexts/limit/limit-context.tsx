import React, { useCallback, useEffect, useState } from 'react'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { getQuoteToken } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { useChainContext } from '../chain-context'
import { Balances } from '../../model/balances'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'
import {
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
import { fetchCurrencies } from '../../apis/swap/currencies'
import { AGGREGATORS } from '../../constants/aggregators'

type LimitContext = {
  balances: Balances
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
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
  balances: {},
  currencies: [],
  setCurrencies: () => {},
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
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress, watch: true })
  const { selectedChain } = useChainContext()

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

  const { data: _currencies } = useQuery(
    ['limit-currencies', selectedChain],
    async () => {
      return fetchCurrencies(selectedChain.id, AGGREGATORS[selectedChain.id])
    },
    {
      initialData: [],
    },
  ) as {
    data: Currency[]
  }
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const { data: balances } = useQuery(
    ['limit-balances', userAddress, balance, selectedChain, currencies],
    async () => {
      if (!userAddress) {
        return {}
      }
      const uniqueCurrencies = currencies
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
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
  ) as {
    data: Balances
  }

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
    if (!fetchCurrenciesDone(_currencies, selectedChain)) {
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
        ? _currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(inputCurrencyAddress),
          ))
        : DEFAULT_INPUT_CURRENCY[selectedChain.id]
      const _outputCurrency = outputCurrencyAddress
        ? _currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(outputCurrencyAddress),
          ))
        : DEFAULT_OUTPUT_CURRENCY[selectedChain.id]

      setCurrencies(
        [..._currencies]
          .concat(
            _inputCurrency ? [_inputCurrency] : [],
            _outputCurrency ? [_outputCurrency] : [],
          )
          .filter(
            (currency, index, self) =>
              self.findIndex((c) =>
                isAddressEqual(c.address, currency.address),
              ) === index,
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
  }, [_currencies, selectedChain, setInputCurrency, setOutputCurrency])

  return (
    <Context.Provider
      value={{
        balances: balances ?? {},
        currencies,
        setCurrencies,
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
