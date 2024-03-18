import type { NextApiRequest, NextApiResponse } from 'next'
import BigNumber from 'bignumber.js'

import { fetchMarketV1s } from '../../../../../../../../../apis/market-v1'
import { fetchOpenOrder } from '../../../../../../../../../apis/open-orders'

import orderSvg from './order-svg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const query = req.query
    const { id, chainId, marketAddress } = query
    if (
      !id ||
      !chainId ||
      !marketAddress ||
      typeof id !== 'string' ||
      typeof chainId !== 'string' ||
      typeof marketAddress !== 'string'
    ) {
      res.json({
        status: 'error',
        message:
          'URL should be /api/nft/chains/[chainId]/markets/[marketAddress]/orders/[id]/image',
      })
      return
    }

    const markets = await fetchMarketV1s(Number(chainId))
    const market = markets.find(
      (m) => m.address.toLowerCase() === String(marketAddress).toLowerCase(),
    )
    if (!market) {
      res.json({
        status: 'error',
        message: 'Something went wrong, while fetching market',
      })
      return
    }

    const isBid = decodeIsBidFromNftId(id)
    const priceIndex = decodePriceIndexFromNftId(id)
    const orderIndex = decodeOrderIndexFromNftId(id)
    const baseToken = market.baseToken
    const quoteToken = market.quoteToken
    const priceBook = market.priceBook
    const price = BigNumber(
      priceBook.indexToPrice(priceIndex).value.toString(),
    ).div(new BigNumber(10).pow(18))
    const basePrecision = new BigNumber(10).pow(baseToken.decimals)

    const openOrder = await fetchOpenOrder(
      Number(chainId),
      marketAddress as `0x${string}`,
      isBid,
      priceIndex,
      orderIndex,
    )

    if (!openOrder) {
      res.json({
        status: 'error',
        message: 'Something went wrong, while fetching open order',
      })
      return
    }

    const totalBaseAmount = BigNumber(openOrder.baseAmount.toString()).div(
      basePrecision,
    )

    const svg = orderSvg
      .replace(/IS_BID_TEXT/g, isBid ? 'Buy' : 'Sell')
      .replace(/POSITION/g, isBid ? 'buy' : 'sell')
      .replace(/TOKEN_PAIR_TEXT/g, `${baseToken.symbol}/${quoteToken.symbol}`)
      .replace(
        /MARKET_ADDRESS_TEXT/g,
        `${marketAddress.slice(0, 6)}...${marketAddress.slice(
          marketAddress.length - 5,
          marketAddress.length,
        )}`,
      )
      .replace(/ORDER_INDEX_TEXT/g, `${orderIndex}`)
      .replace(/QUOTE_PRICE_TEXT/g, `${price.toFixed(2)} ${quoteToken.symbol}`)
      .replace(
        /BASE_AMOUNT_TEXT/g,
        `${totalBaseAmount.toFixed(4)} ${baseToken.symbol}`,
      )

    res
      .writeHead(200, {
        'Content-Type': 'image/svg+xml',
      })
      .end(svg)
  } catch (error) {
    res.json({
      status: 'error',
      message: `Something went wrong, please try again!!!: ${error}`,
    })
  }
}

function decodeIsBidFromNftId(id: string): boolean {
  return BigInt(id) >> 248n === 1n
}

function decodePriceIndexFromNftId(id: string): number {
  return Number(((BigInt(id) >> 232n) & (2n ** 16n - 1n)).toString())
}

function decodeOrderIndexFromNftId(id: string): bigint {
  return BigInt(id) & (2n ** 232n - 1n)
}
