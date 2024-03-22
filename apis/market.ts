import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { CHAIN_IDS } from '../constants/chain'
import { Market } from '../model/market'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { getBuiltGraphSDK } from '../.graphclient'
import { FeePolicy } from '../model/fee-policy'
import { Book } from '../model/book'
import { Depth } from '../model/depth'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'

import { toCurrency } from './utils'

const { getBooks } = getBuiltGraphSDK()

export async function fetchMarkets(chainId: CHAIN_IDS): Promise<Market[]> {
  const { books } = await getBooks(
    {},
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  const markets = books.map((book) => {
    const baseToken = toCurrency(chainId, book.base)
    const quoteToken = toCurrency(chainId, book.quote)
    return new Market({
      chainId: chainId,
      tokens: [baseToken, quoteToken],
      makerPolicy: FeePolicy.from(BigInt(book.makerPolicy)),
      hooks: getAddress(book.hooks),
      takerPolicy: FeePolicy.from(BigInt(book.takerPolicy)),
      latestTick: BigInt(book.latestTick),
      latestPrice: BigInt(book.latestPrice),
      latestTimestamp: Number(book.latestTimestamp),
      books: [
        new Book({
          base: baseToken,
          quote: quoteToken,
          unit: BigInt(book.unit),
          makerPolicy: FeePolicy.from(BigInt(book.makerPolicy)),
          hooks: getAddress(book.hooks),
          takerPolicy: FeePolicy.from(BigInt(book.takerPolicy)),
          latestTick: BigInt(book.latestTick),
          latestPrice: BigInt(book.latestPrice),
          depths: book.depths.map((depth) => {
            return {
              bookId: String(book.id),
              tick: BigInt(depth.tick),
              price: BigInt(depth.price),
              rawAmount: BigInt(depth.rawAmount),
              quoteAmount: BigInt(depth.quoteAmount),
              baseAmount: BigInt(depth.baseAmount),
            } as Depth
          }),
        }),
      ],
    })
  })
  const mergedMarkets: Market[] = []
  for (const market of markets) {
    if (!isWhiteListedMarket(market)) {
      continue
    }
    const existingMarket = mergedMarkets.find((m) => {
      return (
        m.id === market.id &&
        m.makerPolicy.value === market.makerPolicy.value &&
        isAddressEqual(m.hooks, market.hooks) &&
        m.takerPolicy.value === market.takerPolicy.value
      )
    })
    if (existingMarket) {
      if (existingMarket.latestTimestamp < market.latestTimestamp) {
        existingMarket.latestTick = market.latestTick
        existingMarket.latestPrice = market.latestPrice
        existingMarket.latestTimestamp = market.latestTimestamp
      }
      existingMarket.books = existingMarket.books.concat(market.books)
      existingMarket.bids = mergeDepths(
        existingMarket.bids.concat(market.bids),
        true,
      )
      existingMarket.asks = mergeDepths(
        existingMarket.asks.concat(market.asks),
        false,
      )
    } else {
      mergedMarkets.push(market)
    }
  }
  return mergedMarkets
}

function mergeDepths(depths: Depth[], isBid: boolean): Depth[] {
  const mergedDepths: Depth[] = []
  for (const depth of depths) {
    const existingDepth = mergedDepths.find((d) => d.tick === depth.tick)
    if (existingDepth) {
      existingDepth.rawAmount += depth.rawAmount
      existingDepth.quoteAmount += depth.quoteAmount
      existingDepth.baseAmount += depth.baseAmount
    } else {
      mergedDepths.push(depth)
    }
  }
  return mergedDepths.sort((a, b) => {
    if (isBid) {
      return Number(b.price) - Number(a.price)
    } else {
      return Number(a.price) - Number(b.price)
    }
  })
}

function isWhiteListedMarket(market: Market): boolean {
  return (
    isAddressEqual(market.hooks, zeroAddress) &&
    market.makerPolicy.usesQuote &&
    market.takerPolicy.usesQuote &&
    market.takerPolicy.rate === TAKER_DEFAULT_POLICY &&
    market.makerPolicy.rate === MAKER_DEFAULT_POLICY
  )
}
