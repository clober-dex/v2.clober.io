import { getAddress } from 'viem'

import { getBuiltGraphSDK } from '../.graphclient'
import { MarketV1 } from '../model/market-v1'
import { Currency } from '../model/currency'
import { CHAIN_IDS } from '../constants/chain'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
const { getMarkets } = getBuiltGraphSDK()

type DepthDto = {
  price: string
  priceIndex: string
  rawAmount: string
  baseAmount: string
  isBid: boolean
}

export type MarketDto = {
  address: string
  orderToken: string
  takerFee: string
  quoteUnit: string
  a: string
  d: string
  r: string
  latestPriceIndex: string
  latestPrice: string
  maxPriceIndex: string
  priceUpperBound: string
  quoteToken: Currency
  baseToken: Currency
  depths: DepthDto[]
}
export async function fetchMarketV1s(chainId: CHAIN_IDS): Promise<MarketV1[]> {
  const { markets } = await getMarkets(
    {},
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  return markets.map((market) =>
    MarketV1.fromDto({
      address: getAddress(market.id),
      orderToken: getAddress(market.orderToken),
      takerFee: market.takerFee,
      quoteUnit: market.quoteUnit,
      a: market.a,
      d: market.d,
      r: market.r,
      latestPriceIndex: market.latestPriceIndex,
      latestPrice: market.latestPrice,
      maxPriceIndex: market.maxPriceIndex,
      priceUpperBound: market.priceUpperBound,
      quoteToken: {
        address: getAddress(market.quoteToken.id),
        name: market.quoteToken.name,
        symbol: market.quoteToken.symbol,
        decimals: market.quoteToken.decimals,
      },
      baseToken: {
        address: getAddress(market.baseToken.id),
        name: market.baseToken.name,
        symbol: market.baseToken.symbol,
        decimals: market.baseToken.decimals,
      },
      depths: market.depths.map((depth) => ({
        price: depth.price,
        priceIndex: depth.priceIndex,
        rawAmount: depth.rawAmount,
        baseAmount: depth.baseAmount,
        isBid: depth.isBid,
      })),
    }),
  )
}
