import React, { useCallback, useEffect } from 'react'
import { useQuery } from 'wagmi'
import { getAddress, isAddressEqual } from 'viem'

import { useChainContext } from '../chain-context'
import { Chain } from '../../model/chain'
import { Market } from '../../model/market'
import { fetchMarkets } from '../../apis/market'

type MarketContext = {
  markets: Market[]
  selectedMarket?: Market
  setSelectedMarket: (market: Market) => void
}

const Context = React.createContext<MarketContext>({
  markets: [],
  selectedMarket: {} as Market,
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
    Market | undefined
  >(undefined)

  const setSelectedMarket = useCallback(
    (market: Market) => {
      // if chain is changed, reset selected market
      market = markets.find((m) => m.id, market.id) || markets[0]
      if (!market) {
        return
      }
      localStorage.setItem(LOCAL_STORAGE_MARKET_KEY(selectedChain), market.id)
      _setSelectedMarket(market)
    },
    [selectedChain, markets],
  )

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search)
  //   const queryParamMarketAddress = params.get(QUERY_PARAM_MARKET_KEY)
  //   const localStorageMarketAddress = localStorage.getItem(
  //     LOCAL_STORAGE_MARKET_KEY(selectedChain),
  //   )
  //   const market =
  //     markets.find(
  //       (m) =>
  //         queryParamMarketAddress !== null &&
  //         isAddressEqual(m.address, getAddress(queryParamMarketAddress)),
  //     ) ||
  //     markets.find(
  //       (m) =>
  //         localStorageMarketAddress !== null &&
  //         isAddressEqual(m.address, getAddress(localStorageMarketAddress)),
  //     ) ||
  //     markets[0]
  //   setSelectedMarket(market)
  // }, [selectedChain, markets, setSelectedMarket])

  return (
    <Context.Provider value={{ markets, selectedMarket, setSelectedMarket }}>
      {children}
    </Context.Provider>
  )
}

export const useMarketContext = () => React.useContext(Context) as MarketContext
