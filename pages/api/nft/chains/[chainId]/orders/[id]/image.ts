import type { NextApiRequest, NextApiResponse } from 'next'
import BigNumber from 'bignumber.js'
import { getOpenOrder } from '@clober/v2-sdk'

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

    const openOrder = await getOpenOrder({
      chainId: Number(chainId),
      id,
    })

    if (!openOrder) {
      res.json({
        status: 'error',
        message: 'Something went wrong, while fetching open order',
      })
      return
    }

    const baseToken = openOrder.isBid
      ? openOrder.outputCurrency
      : openOrder.inputCurrency
    const quoteToken = openOrder.isBid
      ? openOrder.inputCurrency
      : openOrder.outputCurrency

    const svg = orderSvg
      .replace(/IS_BID_TEXT/g, openOrder.isBid ? 'Buy' : 'Sell')
      .replace(/POSITION/g, openOrder.isBid ? 'buy' : 'sell')
      .replace(/TOKEN_PAIR_TEXT/g, `${baseToken.symbol}/${quoteToken.symbol}`)
      .replace(
        /QUOTE_PRICE_TEXT/g,
        `${Number(openOrder.price).toFixed(2)} ${quoteToken.symbol}`,
      )
      .replace(
        /BASE_AMOUNT_TEXT/g,
        `${BigNumber(openOrder.amount.value).toFixed(4)} ${baseToken.symbol}`,
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
