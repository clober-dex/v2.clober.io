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
  fetchCurrency,
  getCurrencyAddress,
  LOCAL_STORAGE_INPUT_CURRENCY_KEY,
  LOCAL_STORAGE_OUTPUT_CURRENCY_KEY,
} from '../../utils/currency'
import { fetchWhitelistCurrencies } from '../../apis/currencies'

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

  const { inputCurrencyAddress, outputCurrencyAddress } =
    getCurrencyAddress(selectedChain)
  const { data: _currencies } = useQuery(
    [
      'limit-currencies',
      selectedChain,
      inputCurrencyAddress,
      outputCurrencyAddress,
    ],
    async () => {
      const whitelistedCurrencies = await fetchWhitelistCurrencies(
        selectedChain.id,
      )
      const _inputCurrency = inputCurrencyAddress
        ? whitelistedCurrencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(inputCurrencyAddress),
          ))
        : undefined
      const _outputCurrency = outputCurrencyAddress
        ? whitelistedCurrencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
          ) ??
          (await fetchCurrency(
            selectedChain.id,
            getAddress(outputCurrencyAddress),
          ))
        : undefined
      return [...whitelistedCurrencies]
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
    setCurrencies(_currencies)

    const inputCurrency = inputCurrencyAddress
      ? _currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
        )
      : undefined
    const outputCurrency = outputCurrencyAddress
      ? _currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
        )
      : undefined

    setInputCurrency(inputCurrency)
    setOutputCurrency(outputCurrency)

    if (inputCurrency && outputCurrency) {
      const quote = getQuoteToken({
        chainId: selectedChain.id,
        token0: inputCurrency.address,
        token1: outputCurrency.address,
      })
      if (isAddressEqual(quote, inputCurrency.address)) {
        setIsBid(true)
      } else {
        setIsBid(false)
      }
    } else {
      setIsBid(true)
    }
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
