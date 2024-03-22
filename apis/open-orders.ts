import { isAddressEqual } from 'viem'

import { getBuiltGraphSDK } from '../.graphclient'
import { CHAIN_IDS, findSupportChain } from '../constants/chain'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { OpenOrder } from '../model/open-order'
import { Chain } from '../model/chain'
import { getMarketId } from '../utils/market'

import { toCurrency } from './utils'

const { getOpenOrders, getOpenOrder } = getBuiltGraphSDK()

export async function fetchOpenOrders(
  chainId: CHAIN_IDS,
  userAddress: `0x${string}`,
): Promise<OpenOrder[]> {
  const { openOrders } = await getOpenOrders(
    {
      userAddress: userAddress.toLowerCase(),
    },
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  const chain = findSupportChain(chainId) as Chain
  return openOrders.map((openOrder) => {
    const inputToken = toCurrency(chainId, openOrder.book.quote)
    const outputToken = toCurrency(chainId, openOrder.book.base)
    const { quote } = getMarketId(chainId, [
      inputToken.address,
      outputToken.address,
    ])
    return {
      id: BigInt(openOrder.id),
      isBid: isAddressEqual(quote, inputToken.address),
      bookId: BigInt(openOrder.book.id),
      inputToken,
      outputToken,
      tick: BigInt(openOrder.tick),
      orderIndex: BigInt(openOrder.orderIndex),
      txHash: openOrder.txHash as `0x${string}`,
      txUrl: chain.blockExplorers
        ? `${chain.blockExplorers.default.url}/tx/${openOrder.txHash}`
        : '',
      price: BigInt(openOrder.price),
      baseFilledAmount: BigInt(openOrder.baseFilledAmount),
      quoteAmount: BigInt(openOrder.quoteAmount),
      baseAmount: BigInt(openOrder.baseAmount),
      claimableAmount: BigInt(openOrder.baseClaimableAmount),
    }
  })
}

export async function fetchOpenOrder(
  chainId: CHAIN_IDS,
  orderId: string,
): Promise<OpenOrder | null> {
  const { openOrder } = await getOpenOrder(
    {
      orderId: orderId,
    },
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  if (!openOrder) {
    return null
  }
  const chain = findSupportChain(chainId) as Chain
  const inputToken = toCurrency(chainId, openOrder.book.quote)
  const outputToken = toCurrency(chainId, openOrder.book.base)
  const { quote } = getMarketId(chainId, [
    inputToken.address,
    outputToken.address,
  ])
  return {
    id: BigInt(openOrder.id),
    isBid: isAddressEqual(quote, inputToken.address),
    bookId: BigInt(openOrder.book.id),
    inputToken,
    outputToken,
    tick: BigInt(openOrder.tick),
    orderIndex: BigInt(openOrder.orderIndex),
    txHash: openOrder.txHash as `0x${string}`,
    txUrl: chain.blockExplorers
      ? `${chain.blockExplorers.default.url}/tx/${openOrder.txHash}`
      : '',
    price: BigInt(openOrder.price),
    baseFilledAmount: BigInt(openOrder.baseFilledAmount),
    quoteAmount: BigInt(openOrder.quoteAmount),
    baseAmount: BigInt(openOrder.baseAmount),
    claimableAmount: BigInt(openOrder.baseClaimableAmount),
  }
}
