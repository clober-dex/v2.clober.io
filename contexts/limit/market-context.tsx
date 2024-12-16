import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getMarket, getMarketId, Market } from '@clober/v2-sdk'
import { useQuery, useQueryClient } from 'wagmi'
import BigNumber from 'bignumber.js'
import { getAddress } from 'viem'

import { isMarketEqual } from '../../utils/market'
import {
  calculateInputCurrencyAmountString,
  calculateOutputCurrencyAmountString,
  isOrderBookEqual,
  parseDepth,
} from '../../utils/order-book'
import { getPriceDecimals } from '../../utils/prices'
import {
  Decimals,
  DEFAULT_DECIMAL_PLACE_GROUP_LENGTH,
} from '../../model/decimals'
import { useChainContext } from '../chain-context'
import { getCurrencyAddress } from '../../utils/currency'
import { toPlacesString } from '../../utils/bignumber'

import { useLimitContext } from './limit-context'

type MarketContext = {
  selectedMarket?: Market
  setSelectedMarket: (market: Market | undefined) => void
  selectedDecimalPlaces: Decimals | undefined
  setSelectedDecimalPlaces: (decimalPlaces: Decimals | undefined) => void
  availableDecimalPlacesGroups: Decimals[] | null
  depthClickedIndex:
    | {
        isBid: boolean
        index: number
      }
    | undefined
  setDepthClickedIndex: (
    depthClickedIndex:
      | {
          isBid: boolean
          index: number
        }
      | undefined,
  ) => void
  bids: {
    price: string
    size: string
  }[]
  asks: {
    price: string
    size: string
  }[]
}

const Context = React.createContext<MarketContext>({
  selectedMarket: {} as Market,
  setSelectedMarket: (_) => _,
  selectedDecimalPlaces: undefined,
  setSelectedDecimalPlaces: () => {},
  availableDecimalPlacesGroups: null,
  depthClickedIndex: undefined,
  setDepthClickedIndex: () => {},
  bids: [],
  asks: [],
})

export const MarketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const queryClient = useQueryClient()
  const {
    isBid,
    setPriceInput,
    priceInput,
    outputCurrencyAmount,
    inputCurrencyAmount,
    inputCurrency,
    outputCurrency,
    setInputCurrencyAmount,
    setOutputCurrencyAmount,
  } = useLimitContext()

  const [selectedDecimalPlaces, setSelectedDecimalPlaces] = useState<
    Decimals | undefined
  >(undefined)
  const [selectedMarket, setSelectedMarket] = React.useState<
    Market | undefined
  >(undefined)
  const [depthClickedIndex, setDepthClickedIndex] = useState<
    | {
        isBid: boolean
        index: number
      }
    | undefined
  >(undefined)

  const { inputCurrencyAddress, outputCurrencyAddress } = getCurrencyAddress(
    'limit',
    selectedChain,
  )
  const marketId =
    inputCurrencyAddress && outputCurrencyAddress
      ? getMarketId(selectedChain.id, [
          getAddress(inputCurrencyAddress),
          getAddress(outputCurrencyAddress),
        ]).marketId
      : ''

  const { data: market } = useQuery(
    ['market', selectedChain, marketId],
    async () => {
      if (inputCurrencyAddress && outputCurrencyAddress) {
        const queryKeys = queryClient
          .getQueryCache()
          .getAll()
          .map((query) => query.queryKey)
          .filter((key) => key[0] === 'market')
        for (const key of queryKeys) {
          if (key[2] && key[2] !== marketId) {
            queryClient.removeQueries(key)
          }
        }
        return getMarket({
          chainId: selectedChain.id,
          token0: getAddress(inputCurrencyAddress),
          token1: getAddress(outputCurrencyAddress),
          options: {
            useSubgraph: false,
          },
        })
      } else {
        return null
      }
    },
    {
      initialData: null,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  )

  useEffect(() => {
    if (!market) {
      setSelectedMarket(undefined)
    } else if (!isMarketEqual(selectedMarket, market)) {
      setSelectedMarket(market)
    } else if (
      selectedMarket &&
      market &&
      isMarketEqual(selectedMarket, market) &&
      (!isOrderBookEqual(selectedMarket?.asks ?? [], market?.asks ?? []) ||
        !isOrderBookEqual(selectedMarket?.bids ?? [], market?.bids ?? []))
    ) {
      setSelectedMarket(market)
    }
  }, [market, selectedMarket])

  const availableDecimalPlacesGroups = useMemo(() => {
    return selectedMarket &&
      selectedMarket.bids.length + selectedMarket.asks.length > 0
      ? (Array.from(Array(DEFAULT_DECIMAL_PLACE_GROUP_LENGTH).keys())
          .map((i) => {
            const minPrice = Math.min(
              Number(
                selectedMarket.bids.sort(
                  (a, b) => Number(b.price) - Number(a.price),
                )[0]?.price ?? Number.MAX_VALUE,
              ),
              Number(
                selectedMarket.asks.sort(
                  (a, b) => Number(a.price) - Number(b.price),
                )[0]?.price ?? Number.MAX_VALUE,
              ),
            )
            const decimalPlaces = getPriceDecimals(minPrice)
            const label = (10 ** (i - decimalPlaces)).toFixed(
              Math.max(decimalPlaces - i, 0),
            )
            if (new BigNumber(minPrice).gt(label)) {
              return {
                label,
                value: Math.max(decimalPlaces - i, 0),
              }
            }
          })
          .filter((x) => x) as Decimals[])
      : null
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

  // once
  useEffect(() => {
    if (
      !availableDecimalPlacesGroups ||
      availableDecimalPlacesGroups.length === 0
    ) {
      setSelectedDecimalPlaces(undefined)
      return
    }
    setSelectedDecimalPlaces(availableDecimalPlacesGroups[0])
  }, [
    selectedChain.id,
    availableDecimalPlacesGroups,
    selectedMarket?.quote.address,
    selectedMarket?.base.address,
  ])

  // When depthClickedIndex is changed, reset the priceInput
  useEffect(() => {
    if (
      !availableDecimalPlacesGroups ||
      availableDecimalPlacesGroups.length === 0
    ) {
      return
    }
    const minimumDecimalPlaces = availableDecimalPlacesGroups[0].value

    if (depthClickedIndex && inputCurrency && outputCurrency) {
      if (depthClickedIndex.isBid && bids[depthClickedIndex.index]) {
        setPriceInput(
          toPlacesString(
            bids[depthClickedIndex.index].price,
            minimumDecimalPlaces,
          ),
        )
      } else if (!depthClickedIndex.isBid && asks[depthClickedIndex.index]) {
        setPriceInput(
          toPlacesString(
            asks[depthClickedIndex.index].price,
            minimumDecimalPlaces,
          ),
        )
      }
    }
  }, [
    availableDecimalPlacesGroups,
    asks,
    bids,
    depthClickedIndex,
    setPriceInput,
    inputCurrency,
    outputCurrency,
    selectedChain.id,
  ])

  const previousValues = useRef({
    priceInput,
    outputCurrencyAmount,
    inputCurrencyAmount,
  })

  useEffect(() => {
    if (
      new BigNumber(inputCurrencyAmount).isNaN() ||
      new BigNumber(inputCurrencyAmount).isZero() ||
      !outputCurrency?.decimals ||
      !inputCurrency?.decimals
    ) {
      return
    }

    // `priceInput` is changed -> `outputCurrencyAmount` will be changed
    if (previousValues.current.priceInput !== priceInput) {
      const outputCurrencyAmount = calculateOutputCurrencyAmountString(
        isBid,
        inputCurrencyAmount,
        priceInput,
        outputCurrency.decimals,
      )
      setOutputCurrencyAmount(outputCurrencyAmount)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
    // `outputCurrencyAmount` is changed -> `inputCurrencyAmount` will be changed
    else if (
      previousValues.current.outputCurrencyAmount !== outputCurrencyAmount
    ) {
      const inputCurrencyAmount = calculateInputCurrencyAmountString(
        isBid,
        outputCurrencyAmount,
        priceInput,
        inputCurrency.decimals,
      )
      setInputCurrencyAmount(inputCurrencyAmount)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
    // `inputCurrencyAmount` is changed -> `outputCurrencyAmount` will be changed
    else if (
      previousValues.current.inputCurrencyAmount !== inputCurrencyAmount
    ) {
      const outputCurrencyAmount = calculateOutputCurrencyAmountString(
        isBid,
        inputCurrencyAmount,
        priceInput,
        outputCurrency.decimals,
      )
      setOutputCurrencyAmount(outputCurrencyAmount)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
  }, [
    inputCurrency?.decimals,
    outputCurrency?.decimals,
    inputCurrencyAmount,
    isBid,
    outputCurrencyAmount,
    priceInput,
    setInputCurrencyAmount,
    setOutputCurrencyAmount,
  ])

  return (
    <Context.Provider
      value={{
        selectedMarket,
        setSelectedMarket,
        selectedDecimalPlaces,
        setSelectedDecimalPlaces,
        availableDecimalPlacesGroups,
        depthClickedIndex,
        setDepthClickedIndex,
        bids,
        asks,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
