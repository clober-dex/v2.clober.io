import { getAddress, isAddressEqual } from 'viem'

import { getBuiltGraphSDK } from '../.graphclient'
import { CHAIN_IDS, findSupportChain } from '../constants/chain'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { OpenOrder } from '../model/open-order'
import { Chain } from '../model/chain'
import { getMarketId } from '../utils/market'
import { quoteToBase } from '../utils/tick'

import { fetchCurrency } from '../utils/currency'

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
  const currencies = await Promise.all(
    openOrders
      .map((openOrder) => [
        getAddress(openOrder.book.base.id),
        getAddress(openOrder.book.quote.id),
      ])
      .flat()
      .filter(
        (address, index, self) =>
          self.findIndex((c) => isAddressEqual(c, address)) === index,
      )
      .map((address) => fetchCurrency(chainId, address)),
  )
  return openOrders.map((openOrder) => {
    const inputToken = currencies.find((c) =>
      isAddressEqual(c.address, getAddress(openOrder.book.quote.id)),
    )!
    const outputToken = currencies.find((c) =>
      isAddressEqual(c.address, getAddress(openOrder.book.base.id)),
    )!
    const { quote } = getMarketId(chainId, [
      inputToken.address,
      outputToken.address,
    ])
    const isBid = isAddressEqual(quote, inputToken.address)
    const tick = BigInt(openOrder.tick)
    const rawAmount = BigInt(openOrder.rawAmount)
    const rawFilledAmount = BigInt(openOrder.rawFilledAmount)
    const unit = BigInt(openOrder.book.unit)
    const quoteAmount = unit * rawAmount
    const rawClaimableAmount = BigInt(openOrder.rawClaimableAmount)
    return {
      id: BigInt(openOrder.id),
      isBid,
      bookId: BigInt(openOrder.book.id),
      inputToken,
      outputToken,
      tick,
      orderIndex: BigInt(openOrder.orderIndex),
      txHash: openOrder.txHash as `0x${string}`,
      txUrl: chain.blockExplorers
        ? `${chain.blockExplorers.default.url}/tx/${openOrder.txHash}`
        : '',
      price: BigInt(openOrder.price),
      quoteAmount,
      baseAmount: isBid ? quoteToBase(tick, quoteAmount, false) : quoteAmount,
      baseFilledAmount: isBid
        ? quoteToBase(tick, unit * rawFilledAmount, false)
        : unit * rawFilledAmount,
      claimableAmount: quoteToBase(tick, unit * rawClaimableAmount, false),
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
  const inputToken = await fetchCurrency(
    chainId,
    getAddress(openOrder.book.quote.id),
  )
  const outputToken = await fetchCurrency(
    chainId,
    getAddress(openOrder.book.base.id),
  )
  const { quote } = getMarketId(chainId, [
    inputToken.address,
    outputToken.address,
  ])
  const isBid = isAddressEqual(quote, inputToken.address)
  const tick = BigInt(openOrder.tick)
  const rawAmount = BigInt(openOrder.rawAmount)
  const rawFilledAmount = BigInt(openOrder.rawFilledAmount)
  const unit = BigInt(openOrder.book.unit)
  const quoteAmount = unit * rawAmount
  const rawClaimableAmount = BigInt(openOrder.rawClaimableAmount)
  return {
    id: BigInt(openOrder.id),
    isBid,
    bookId: BigInt(openOrder.book.id),
    inputToken,
    outputToken,
    tick,
    orderIndex: BigInt(openOrder.orderIndex),
    txHash: openOrder.txHash as `0x${string}`,
    txUrl: chain.blockExplorers
      ? `${chain.blockExplorers.default.url}/tx/${openOrder.txHash}`
      : '',
    price: BigInt(openOrder.price),
    quoteAmount,
    baseAmount: isBid ? quoteToBase(tick, quoteAmount, false) : quoteAmount,
    baseFilledAmount: isBid
      ? quoteToBase(tick, unit * rawFilledAmount, false)
      : unit * rawFilledAmount,
    claimableAmount: quoteToBase(tick, unit * rawClaimableAmount, false),
  }
}
