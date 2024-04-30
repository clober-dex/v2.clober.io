import React, { useEffect, useMemo, useState } from 'react'
import { getMarket, Market } from '@clober/v2-sdk'
import { useQuery } from 'wagmi'
import BigNumber from 'bignumber.js'

import { isMarketEqual } from '../../utils/market'
import { isOrderBookEqual, parseDepth } from '../../utils/order-book'
import { getPriceDecimals } from '../../utils/prices'
import { Decimals, DEFAULT_DECIMAL_PLACES_GROUPS } from '../../model/decimals'
import { useChainContext } from '../chain-context'

import { useLimitContext } from './limit-context'

type MarketContext = {
  selectedMarket?: Market
  setSelectedMarket: (market: Market | undefined) => void
  selectedDecimalPlaces: Decimals | undefined
  setSelectedDecimalPlaces: (decimalPlaces: Decimals | undefined) => void
  availableDecimalPlacesGroups: Decimals[]
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
  availableDecimalPlacesGroups: [],
  bids: [],
  asks: [],
})

export const MarketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { inputCurrency, outputCurrency } = useLimitContext()

  const [selectedDecimalPlaces, setSelectedDecimalPlaces] = useState<
    Decimals | undefined
  >(undefined)
  const [selectedMarket, setSelectedMarket] = React.useState<
    Market | undefined
  >(undefined)

  const { data: market } = useQuery(
    ['updated-market', selectedChain, inputCurrency, outputCurrency],
    async () => {
      if (inputCurrency && outputCurrency) {
        return getMarket({
          chainId: selectedChain.id,
          token0: inputCurrency.address,
          token1: outputCurrency.address,
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
    } else if (!selectedMarket && market) {
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
    const availableDecimalPlacesGroups = selectedMarket
      ? (Array.from(Array(4).keys())
          .map((i) => {
            const minPrice = Math.min(
              selectedMarket.bids.sort((a, b) => b.price - a.price)[0]?.price ??
                Number.MAX_VALUE,
              selectedMarket.asks.sort((a, b) => a.price - b.price)[0]?.price ??
                Number.MAX_VALUE,
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
        selectedMarket,
        setSelectedMarket,
        selectedDecimalPlaces,
        setSelectedDecimalPlaces,
        availableDecimalPlacesGroups,
        bids,
        asks,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
