import { createPublicClient, Hash, http } from 'viem'
import { GetWalletClientResult } from '@wagmi/core'
import { CHAIN_IDS, Transaction } from '@clober/v2-sdk'

import { supportChains } from '../constants/chain'

export async function sendTransaction(
  walletClient: GetWalletClientResult,
  transaction: Transaction,
): Promise<Hash | undefined> {
  if (!walletClient) {
    return
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain.id),
    transport: http(),
  })
  const hash = await walletClient.sendTransaction({
    data: transaction.data,
    to: transaction.to,
    value: transaction.value,
    gas: transaction.gas,
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

export async function waitTransaction(
  chainId: CHAIN_IDS,
  hash: Hash,
): Promise<void> {
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  await publicClient.waitForTransactionReceipt({ hash })
}
