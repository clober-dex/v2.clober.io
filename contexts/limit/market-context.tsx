import React from 'react'
import { Market } from '@clober/v2-sdk'

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

  return (
    <Context.Provider value={{ selectedMarket, setSelectedMarket }}>
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
