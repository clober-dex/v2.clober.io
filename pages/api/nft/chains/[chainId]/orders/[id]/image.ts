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

    const baseToken = openOrder.isBid
      ? openOrder.outputToken
      : openOrder.inputToken
    const quoteToken = openOrder.isBid
      ? openOrder.inputToken
      : openOrder.outputToken

    const price = formatPrice(
      toPrice(openOrder.tick),
      quoteToken.decimals,
      baseToken.decimals,
    )
    const basePrecision = new BigNumber(10).pow(baseToken.decimals)

    const totalBaseAmount = BigNumber(openOrder.baseAmount.toString()).div(
      basePrecision,
    )

    const svg = orderSvg
      .replace(/IS_BID_TEXT/g, openOrder.isBid ? 'Buy' : 'Sell')
      .replace(/POSITION/g, openOrder.isBid ? 'buy' : 'sell')
      .replace(/TOKEN_PAIR_TEXT/g, `${baseToken.symbol}/${quoteToken.symbol}`)
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
