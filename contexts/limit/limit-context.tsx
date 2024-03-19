import React, { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { getAddress, isAddressEqual } from 'viem'

import { Currency } from '../../model/currency'
import { formatUnits } from '../../utils/bigint'
import { Decimals, DEFAULT_DECIMAL_PLACES_GROUPS } from '../../model/decimals'
import { formatPrice, getPriceDecimals } from '../../utils/prices'
import { parseDepth } from '../../utils/order-book'
import { useChainContext } from '../chain-context'
import { Chain } from '../../model/chain'
import { getMarketId } from '../../utils/market'

import { useMarketContext } from './market-context'
import { useLimitCurrencyContext } from './limit-currency-context'

type LimitContext = {
  isBid: boolean
  setIsBid: (isBid: (prevState: boolean) => boolean) => void
  selectMode: 'none' | 'settings'
  setSelectMode: (selectMode: 'none' | 'settings') => void
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
  claimBounty: string
  setClaimBounty: (amount: string) => void
  isPostOnly: boolean
  setIsPostOnly: (isPostOnly: (prevState: boolean) => boolean) => void
  selectedDecimalPlaces: Decimals | undefined
  setSelectedDecimalPlaces: (decimalPlaces: Decimals | undefined) => void
  priceInput: string
  setPriceInput: (priceInput: string) => void
  availableDecimalPlacesGroups: Decimals[]
  bids: { price: string; size: string }[]
  asks: { price: string; size: string }[]
}

const Context = React.createContext<LimitContext>({
  isBid: true,
  setIsBid: () => {},
  selectMode: 'none',
  setSelectMode: () => {},
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
  claimBounty: '',
  setClaimBounty: () => {},
  isPostOnly: false,
  setIsPostOnly: () => {},
  selectedDecimalPlaces: undefined,
  setSelectedDecimalPlaces: () => {},
  priceInput: '',
  setPriceInput: () => {},
  availableDecimalPlacesGroups: [],
  bids: [],
  asks: [],
})

const LOCAL_STORAGE_INPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-inputCurrency-limit`
const LOCAL_STORAGE_OUTPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-outputCurrency-limit`
const QUERY_PARAM_INPUT_CURRENCY_KEY = 'inputCurrency'
const QUERY_PARAM_OUTPUT_CURRENCY_KEY = 'outputCurrency'

export const LimitProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { markets, selectedMarket, setSelectedMarket } = useMarketContext()
  const { currencies } = useLimitCurrencyContext()
  const { selectedChain } = useChainContext()

  const [isBid, setIsBid] = useState(true)
  const [selectMode, setSelectMode] = useState<'none' | 'settings'>('none')

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
  const [claimBounty, setClaimBounty] = useState(
    formatUnits(
      selectedChain.defaultGasPrice,
      selectedChain.nativeCurrency.decimals,
    ),
  )
  const [isPostOnly, setIsPostOnly] = useState(false)
  const [selectedDecimalPlaces, setSelectedDecimalPlaces] = useState<
    Decimals | undefined
  >(undefined)
  const [priceInput, setPriceInput] = useState('')

  const availableDecimalPlacesGroups = useMemo(() => {
    const availableDecimalPlacesGroups = selectedMarket
      ? (Array.from(Array(4).keys())
          .map((i) => {
            const bidSideMinPrice =
              selectedMarket.bids.sort(
                (a, b) => Number(b.price) - Number(a.price),
              )[0]?.price ?? 2n ** 256n - 1n
            const askSideMinPrice =
              selectedMarket.asks.sort(
                (a, b) => Number(a.price) - Number(b.price),
              )[0]?.price ?? 2n ** 256n - 1n

            const [minPrice, decimalPlaces] =
              bidSideMinPrice <= askSideMinPrice
                ? [
                    formatPrice(
                      bidSideMinPrice,
                      selectedMarket.quote.decimals,
                      selectedMarket.base.decimals,
                    ),
                    getPriceDecimals(
                      bidSideMinPrice,
                      selectedMarket.quote.decimals,
                      selectedMarket.base.decimals,
                    ),
                  ]
                : [
                    formatPrice(
                      askSideMinPrice,
                      selectedMarket.base.decimals,
                      selectedMarket.quote.decimals,
                    ),
                    getPriceDecimals(
                      askSideMinPrice,
                      selectedMarket.base.decimals,
                      selectedMarket.quote.decimals,
                    ),
                  ]
            const label = (10 ** (i - decimalPlaces)).toFixed(
              Math.max(decimalPlaces - i, 0),
            )
            if (new BigNumber(minPrice).gt(label)) {
              return {
                label,
                value: decimalPlaces - i,
              }
            }
          })
          .filter((x) => x) as Decimals[])
      : []
    return availableDecimalPlacesGroups.length > 0
      ? availableDecimalPlacesGroups
      : DEFAULT_DECIMAL_PLACES_GROUPS
  }, [selectedMarket])

  const [bids, asks] = useMemo(
    () =>
      selectedMarket && selectedDecimalPlaces
        ? [
            parseDepth(true, selectedMarket, selectedDecimalPlaces),
            parseDepth(false, selectedMarket, selectedDecimalPlaces),
          ]
        : [[], []],
    [selectedDecimalPlaces, selectedMarket],
  )

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

    const inputCurrency = inputCurrencyAddress
      ? currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
        )
      : undefined
    const outputCurrency = outputCurrencyAddress
      ? currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
        )
      : undefined
    setInputCurrency(inputCurrency)
    setOutputCurrency(outputCurrency)
    if (inputCurrency && outputCurrency) {
      const market = markets.find(
        (m) =>
          m.id ===
          getMarketId(selectedChain.id, [
            inputCurrency.address,
            outputCurrency.address,
          ]).marketId,
      )
      if (market) {
        setSelectedMarket(market)
      }
    } else {
      // visit website first time
      if (markets.length > 0) {
        setSelectedMarket(markets[0])
      }
    }
  }, [
    currencies,
    markets,
    selectedChain,
    setInputCurrency,
    setOutputCurrency,
    setSelectedMarket,
  ])

  return (
    <Context.Provider
      value={{
        isBid,
        setIsBid,
        selectMode,
        setSelectMode,
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
        claimBounty,
        setClaimBounty,
        isPostOnly,
        setIsPostOnly,
        selectedDecimalPlaces,
        setSelectedDecimalPlaces,
        priceInput,
        setPriceInput,
        availableDecimalPlacesGroups,
        bids,
        asks,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLimitContext = () => React.useContext(Context) as LimitContext
