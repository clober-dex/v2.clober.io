import React from 'react'
import { useQuery } from 'wagmi'

import { useChainContext } from '../chain-context'
import { Market } from '../../model/market'
import { fetchMarkets } from '../../apis/market'

type MarketContext = {
  markets: Market[]
  selectedMarket?: Market
  setSelectedMarket: (market: Market | undefined) => void
}

const Context = React.createContext<MarketContext>({
  markets: [],
  selectedMarket: {} as Market,
  setSelectedMarket: (_) => _,
})

export const MarketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()

  const { data: markets } = useQuery(
    ['markets', selectedChain],
    async () => {
      return fetchMarkets(selectedChain.id)
    },
    {
      initialData: [],
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  )

  const [selectedMarket, setSelectedMarket] = React.useState<
    Market | undefined
  >(undefined)

  return (
    <Context.Provider value={{ markets, selectedMarket, setSelectedMarket }}>
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
