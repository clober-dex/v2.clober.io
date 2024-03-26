import { getAddress, isAddressEqual, zeroAddress } from 'viem'

import { CHAIN_IDS } from '../constants/chain'
import { Market } from '../model/market'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { getBuiltGraphSDK } from '../.graphclient'
import { FeePolicy } from '../model/fee-policy'
import { Book } from '../model/book'
import { Depth, MergedDepth } from '../model/depth'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'
import { invertPrice, quoteToBase } from '../utils/tick'
import { getMarketId } from '../utils/market'
import { formatPrice } from '../utils/prices'
import { fetchCurrency } from '../utils/currency'

const { getBooks } = getBuiltGraphSDK()

export async function fetchMarkets(chainId: CHAIN_IDS): Promise<Market[]> {
  const { books } = await getBooks(
    {},
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  const currencies = await Promise.all(
    books
      .map((book) => [getAddress(book.base.id), getAddress(book.quote.id)])
      .flat()
      .filter(
        (address, index, self) =>
          self.findIndex((c) => isAddressEqual(c, address)) === index,
      )
      .map((address) => fetchCurrency(chainId, address)),
  )
  const markets = books.map((book) => {
    const outputToken = currencies.find((c) =>
      isAddressEqual(c.address, getAddress(book.base.id)),
    )!
    const inputToken = currencies.find((c) =>
      isAddressEqual(c.address, getAddress(book.quote.id)),
    )!
    const unit = BigInt(book.unit)
    const { quote, base } = getMarketId(chainId, [
      outputToken.address,
      inputToken.address,
    ])
    const quoteDecimals = isAddressEqual(inputToken.address, quote)
      ? inputToken.decimals
      : outputToken.decimals
    const baseDecimals = isAddressEqual(outputToken.address, base)
      ? outputToken.decimals
      : inputToken.decimals
    return new Market({
      chainId: chainId,
      tokens: [outputToken, inputToken],
      makerPolicy: FeePolicy.from(BigInt(book.makerPolicy)),
      hooks: getAddress(book.hooks),
      takerPolicy: FeePolicy.from(BigInt(book.takerPolicy)),
      latestPrice: isAddressEqual(inputToken.address, quote)
        ? formatPrice(book.latestPrice, quoteDecimals, baseDecimals)
        : formatPrice(
            invertPrice(book.latestPrice),
            quoteDecimals,
            baseDecimals,
          ),
      latestTimestamp: Number(book.latestTimestamp),
      books: [
        new Book({
          id: BigInt(book.id),
          quote: inputToken,
          base: outputToken,
          unit,
          makerPolicy: FeePolicy.from(BigInt(book.makerPolicy)),
          hooks: getAddress(book.hooks),
          takerPolicy: FeePolicy.from(BigInt(book.takerPolicy)),
          latestTick: BigInt(book.latestTick),
          latestPrice: BigInt(book.latestPrice),
          depths: book.depths.map((depth) => {
            const rawAmount = BigInt(depth.rawAmount)
            const quoteAmount = unit * rawAmount
            const tick = BigInt(depth.tick)
            const { quote } = getMarketId(chainId, [
              inputToken.address,
              outputToken.address,
            ])
            const isBid = isAddressEqual(inputToken.address, quote)
            return {
              bookId: String(book.id),
              tick,
              price: BigInt(depth.price),
              rawAmount,
              baseAmount: isBid
                ? quoteToBase(tick, quoteAmount, false)
                : quoteAmount,
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

function mergeDepths(depths: MergedDepth[], isBid: boolean): MergedDepth[] {
  const mergedDepths: MergedDepth[] = []
  for (const depth of depths) {
    const existingDepth = mergedDepths.find((d) => d.tick === depth.tick)
    if (existingDepth) {
      existingDepth.rawAmount += depth.rawAmount
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
    market.takerPolicy.rate === TAKER_DEFAULT_POLICY.rate &&
    market.makerPolicy.rate === MAKER_DEFAULT_POLICY.rate
  )
}
