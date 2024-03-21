import { NextApiRequest, NextApiResponse } from 'next'

import { fetchOpenOrder } from '../../../../../../../apis/open-orders'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
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

  res.json({
    id,
    name: `Order #${id} on Clober Market ${
      openOrder.outputToken.symbol ?? '?'
    }/${openOrder.inputToken.symbol ?? '?'}`,
    description: 'Clober Market Order',
    image: `https://clober.io/api/nft/chains/${chainId}/orders/${id}/image`,
  })
}
