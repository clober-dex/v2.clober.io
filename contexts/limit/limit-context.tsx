import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'

import { Currency } from '../../model/currency'
import { formatUnits, min } from '../../utils/bigint'
import { Decimals, DEFAULT_DECIMAL_PLACES_GROUPS } from '../../model/decimals'
import { getPriceDecimals, PRICE_DECIMAL } from '../../utils/prices'
import { parseDepth } from '../../utils/order-book'
import { useChainContext } from '../chain-context'

import { useMarketContext } from './market-context'

type LimitContext = {
  isBid: boolean
  setIsBid: (isBid: (prevState: boolean) => boolean) => void
  selectMode: 'none' | 'settings' | 'selectMarket'
  setSelectMode: (selectMode: 'none' | 'settings' | 'selectMarket') => void
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

export const LimitProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedMarket } = useMarketContext()
  const { selectedChain } = useChainContext()

  const [isBid, setIsBid] = useState(true)
  const [selectMode, setSelectMode] = useState<
    'none' | 'settings' | 'selectMarket'
  >('none')

  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [inputCurrency, setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')

  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [outputCurrency, setOutputCurrency] = useState<Currency | undefined>(
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
            const minPrice = min(
              selectedMarket.bids.sort(
                (a, b) => Number(b.tick) - Number(a.tick),
              )[0]?.price ?? 2n ** 256n - 1n,
              selectedMarket.asks.sort(
                (a, b) => Number(a.tick) - Number(b.tick),
              )[0]?.price ?? 2n ** 256n - 1n,
            )
            const decimalPlaces = getPriceDecimals(minPrice)
            const label = (10 ** (i - decimalPlaces)).toFixed(
              Math.max(decimalPlaces - i, 0),
            )
            if (new BigNumber(formatUnits(minPrice, PRICE_DECIMAL)).gt(label)) {
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
