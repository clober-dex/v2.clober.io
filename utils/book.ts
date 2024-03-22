import { createPublicClient, http } from 'viem'

import { BookKey } from '../model/book-key'
import { CHAIN_IDS, supportChains } from '../constants/chain'
import { BOOK_MANAGER_ABI } from '../abis/core/book-manager-abi'
import { CONTRACT_ADDRESSES } from '../constants/addresses'

import { toId } from './book-id'

export const isOpen = async (chainId: CHAIN_IDS, key: BookKey) => {
  const bookId = toId(key)
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESSES[chainId].BookManager,
    abi: BOOK_MANAGER_ABI,
    functionName: 'isOpened',
    args: [bookId],
  })
  return result
}
