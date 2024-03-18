import React, { useCallback, useEffect } from 'react'
import { useQuery } from 'wagmi'
import { getAddress, isAddressEqual } from 'viem'

import { MarketV1 } from '../../model/market-v1'
import { fetchMarkets } from '../../apis/market'
import { useChainContext } from '../chain-context'
import { Chain } from '../../model/chain'

type MarketContext = {
  markets: MarketV1[]
  selectedMarket?: MarketV1
  setSelectedMarket: (market: MarketV1) => void
}

const Context = React.createContext<MarketContext>({
  markets: [],
  selectedMarket: {} as MarketV1,
  setSelectedMarket: (_) => _,
})

const LOCAL_STORAGE_MARKET_KEY = (chain: Chain) => `${chain.id}-market`
const QUERY_PARAM_MARKET_KEY = 'market'

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

  const [selectedMarket, _setSelectedMarket] = React.useState<
    MarketV1 | undefined
  >(undefined)

  const setSelectedMarket = useCallback(
    (market: MarketV1) => {
      // if chain is changed, reset selected market
      market =
        markets.find((m) => isAddressEqual(m.address, market.address)) ||
        markets[0]
      if (!market) {
        return
      }
      localStorage.setItem(
        LOCAL_STORAGE_MARKET_KEY(selectedChain),
        market.address,
      )
      _setSelectedMarket(market)
    },
    [selectedChain, markets],
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryParamMarketAddress = params.get(QUERY_PARAM_MARKET_KEY)
    const localStorageMarketAddress = localStorage.getItem(
      LOCAL_STORAGE_MARKET_KEY(selectedChain),
    )
    const market =
      markets.find(
        (m) =>
          queryParamMarketAddress !== null &&
          isAddressEqual(m.address, getAddress(queryParamMarketAddress)),
      ) ||
      markets.find(
        (m) =>
          localStorageMarketAddress !== null &&
          isAddressEqual(m.address, getAddress(localStorageMarketAddress)),
      ) ||
      markets[0]
    setSelectedMarket(market)
  }, [selectedChain, markets, setSelectedMarket])

  return (
    <Context.Provider value={{ markets, selectedMarket, setSelectedMarket }}>
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
