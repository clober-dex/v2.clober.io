import { createPublicClient, Hash, http } from 'viem'
import { GetWalletClientResult } from '@wagmi/core'
import { approveERC20, Transaction } from '@clober/v2-sdk'

import { supportChains } from '../constants/chain'
import { Currency } from '../model/currency'
import { RPC_URL } from '../constants/rpc-urls'

export const approve20 = async (
  walletClient: GetWalletClientResult,
  currency: Currency,
  amount: string,
): Promise<Hash | undefined> => {
  if (!walletClient) {
    return
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain.id),
    transport: http(),
  })
  const hash = await approveERC20({
    chainId: walletClient.chain.id,
    walletClient: walletClient as any,
    token: currency.address,
    amount,
    options: {
      rpcUrl: RPC_URL[walletClient.chain.id],
    },
  })
  if (hash) {
    await publicClient.waitForTransactionReceipt({ hash })
  }
  return hash
}

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
