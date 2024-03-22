import { getAddress, isAddressEqual } from 'viem'

import { getBuiltGraphSDK } from '../.graphclient'
import { CHAIN_IDS, findSupportChain } from '../constants/chain'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { OpenOrder } from '../model/open-order'
import { Chain } from '../model/chain'
import { getMarketId } from '../utils/market'
import { Currency } from '../model/currency'

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
    const inputToken = {
      address: getAddress(openOrder.book.quote.id),
      name: openOrder.book.quote.name,
      symbol: openOrder.book.quote.symbol,
      decimals: Number(openOrder.book.quote.decimals),
    } as Currency
    const outputToken = {
      address: getAddress(openOrder.book.base.id),
      name: openOrder.book.base.name,
      symbol: openOrder.book.base.symbol,
      decimals: Number(openOrder.book.base.decimals),
    } as Currency
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
  const inputToken = {
    address: getAddress(openOrder.book.quote.id),
    name: openOrder.book.quote.name,
    symbol: openOrder.book.quote.symbol,
    decimals: Number(openOrder.book.quote.decimals),
  } as Currency
  const outputToken = {
    address: getAddress(openOrder.book.base.id),
    name: openOrder.book.base.name,
    symbol: openOrder.book.base.symbol,
    decimals: Number(openOrder.book.base.decimals),
  } as Currency
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
