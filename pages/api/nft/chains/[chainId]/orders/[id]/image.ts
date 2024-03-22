import type { NextApiRequest, NextApiResponse } from 'next'
import BigNumber from 'bignumber.js'

import { fetchOpenOrder } from '../../../../../../../apis/open-orders'
import { toPrice } from '../../../../../../../utils/tick'
import { formatPrice } from '../../../../../../../utils/prices'

import orderSvg from './order-svg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const query = req.query
    const { id, chainId } = query
    if (
      !id ||
      !chainId ||
      typeof id !== 'string' ||
      typeof chainId !== 'string'
    ) {
      res.json({
        status: 'error',
        message: 'URL should be /api/nft/chains/[chainId]/orders/[id]/image',
      })
      return
    }

    const openOrder = await fetchOpenOrder(Number(chainId), id)

    if (!openOrder) {
      res.json({
        status: 'error',
        message: 'Something went wrong, while fetching open order',
      })
      return
    }

    const isBid = true
    const orderIndex = openOrder.orderIndex
    const baseToken = openOrder.outputToken
    const quoteToken = openOrder.inputToken

    const price = formatPrice(
      toPrice(openOrder.tick),
      openOrder.inputToken.decimals,
      openOrder.outputToken.decimals,
    )
    const bookId = String(openOrder.bookId)
    const basePrecision = new BigNumber(10).pow(baseToken.decimals)

    const totalBaseAmount = BigNumber(openOrder.baseAmount.toString()).div(
      basePrecision,
    )

    const svg = orderSvg
      .replace(/IS_BID_TEXT/g, isBid ? 'Buy' : 'Sell')
      .replace(/POSITION/g, isBid ? 'buy' : 'sell')
      .replace(/TOKEN_PAIR_TEXT/g, `${baseToken.symbol}/${quoteToken.symbol}`)
      .replace(
        /MARKET_ADDRESS_TEXT/g,
        `${bookId.slice(0, 6)}...${bookId.slice(
          bookId.length - 5,
          bookId.length,
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
