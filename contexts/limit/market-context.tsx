import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getMarket, Market, getPriceNeighborhood } from '@clober/v2-sdk'
import { useQuery } from 'wagmi'
import BigNumber from 'bignumber.js'
import { getAddress } from 'viem'

import { isMarketEqual } from '../../utils/market'
import {
  calculateOutputCurrencyAmountString,
  calculatePriceInputString,
  isOrderBookEqual,
  parseDepth,
} from '../../utils/order-book'
import { getPriceDecimals } from '../../utils/prices'
import { Decimals, DEFAULT_DECIMAL_PLACES_GROUPS } from '../../model/decimals'
import { useChainContext } from '../chain-context'
import { getCurrencyAddress } from '../../utils/currency'
import { toPlacesString } from '../../utils/bignumber'
import { RPC_URL } from '../../constants/rpc-urls'

import { useLimitContext } from './limit-context'

type MarketContext = {
  selectedMarket?: Market
  setSelectedMarket: (market: Market | undefined) => void
  selectedDecimalPlaces: Decimals | undefined
  setSelectedDecimalPlaces: (decimalPlaces: Decimals | undefined) => void
  availableDecimalPlacesGroups: Decimals[]
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
  availableDecimalPlacesGroups: [],
  depthClickedIndex: undefined,
  setDepthClickedIndex: () => {},
  bids: [],
  asks: [],
})

export const MarketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const {
    isBid,
    setPriceInput,
    priceInput,
    outputCurrencyAmount,
    inputCurrencyAmount,
    inputCurrency,
    outputCurrency,
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
  const { data: market } = useQuery(
    [
      'updated-market',
      selectedChain,
      inputCurrencyAddress,
      outputCurrencyAddress,
    ],
    async () => {
      if (inputCurrencyAddress && outputCurrencyAddress) {
        return getMarket({
          chainId: selectedChain.id,
          token0: getAddress(inputCurrencyAddress),
          token1: getAddress(outputCurrencyAddress),
          options: {
            rpcUrl: RPC_URL[selectedChain.id],
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
    const availableDecimalPlacesGroups = selectedMarket
      ? (Array.from(Array(4).keys())
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

  // once
  useEffect(() => {
    setSelectedDecimalPlaces(availableDecimalPlacesGroups[0])
  }, [availableDecimalPlacesGroups])

  // When depth is changed
  useEffect(() => {
    setDepthClickedIndex(undefined)

    setPriceInput(
      isBid
        ? toPlacesString(asks[0]?.price ?? bids[0]?.price ?? '1')
        : toPlacesString(bids[0]?.price ?? asks[0]?.price ?? '1'),
    )
  }, [asks, bids, isBid, setPriceInput])

  // When depthClickedIndex is changed, reset the priceInput
  useEffect(() => {
    if (depthClickedIndex && inputCurrency && outputCurrency) {
      if (depthClickedIndex.isBid && bids[depthClickedIndex.index]) {
        const {
          normal: {
            now: { price },
          },
        } = getPriceNeighborhood({
          chainId: selectedChain.id,
          price: bids[depthClickedIndex.index].price,
          currency0: inputCurrency,
          currency1: outputCurrency,
        })
        setPriceInput(toPlacesString(price))
      } else if (!depthClickedIndex.isBid && asks[depthClickedIndex.index]) {
        const {
          normal: {
            up: { price },
          },
        } = getPriceNeighborhood({
          chainId: selectedChain.id,
          price: asks[depthClickedIndex.index].price,
          currency0: inputCurrency,
          currency1: outputCurrency,
        })
        setPriceInput(toPlacesString(price))
      }
    }
  }, [
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
      !outputCurrency?.decimals
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
    // `outputCurrencyAmount` is changed -> `priceInput` will be changed
    else if (
      previousValues.current.outputCurrencyAmount !== outputCurrencyAmount
    ) {
      const priceInput = calculatePriceInputString(
        isBid,
        inputCurrencyAmount,
        outputCurrencyAmount,
        previousValues.current.priceInput,
      )
      setPriceInput(priceInput)
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
    inputCurrencyAmount,
    isBid,
    outputCurrency?.decimals,
    outputCurrencyAmount,
    priceInput,
    setOutputCurrencyAmount,
    setPriceInput,
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
