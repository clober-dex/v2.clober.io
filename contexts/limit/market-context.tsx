import React, { useEffect } from 'react'
import { getMarket, Market } from '@clober/v2-sdk'
import { useQuery } from 'wagmi'

import { isMarketEqual } from '../../utils/market'
import { isOrderBookEqual } from '../../utils/order-book'

type MarketContext = {
  selectedMarket?: Market
  setSelectedMarket: (market: Market | undefined) => void
}

const Context = React.createContext<MarketContext>({
  selectedMarket: {} as Market,
  setSelectedMarket: (_) => _,
})

export const MarketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [selectedMarket, setSelectedMarket] = React.useState<
    Market | undefined
  >(undefined)

  const { data: updatedMarket } = useQuery(
    ['updated-market'],
    async () => {
      if (!selectedMarket) {
        return undefined
      }
      return getMarket({
        chainId: selectedMarket.chainId,
        token0: selectedMarket.base.address,
        token1: selectedMarket.quote.address,
      })
    },
    {
      initialData: undefined,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  )

  useEffect(() => {
    if (
      isMarketEqual(selectedMarket, updatedMarket) &&
      (!isOrderBookEqual(
        selectedMarket?.asks ?? [],
        updatedMarket?.asks ?? [],
      ) ||
        !isOrderBookEqual(
          selectedMarket?.bids ?? [],
          updatedMarket?.bids ?? [],
        ))
    ) {
      setSelectedMarket(updatedMarket)
    }
  }, [selectedMarket, updatedMarket])

  return (
    <Context.Provider value={{ selectedMarket, setSelectedMarket }}>
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
