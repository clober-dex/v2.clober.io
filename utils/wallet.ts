import {
  createPublicClient,
  Hash,
  http,
  SimulateContractParameters,
  WriteContractParameters,
} from 'viem'
import { GetWalletClientResult } from '@wagmi/core'
import { Transaction } from '@clober/v2-sdk'

import { supportChains } from '../constants/chain'

export async function writeContract(
  walletClient: GetWalletClientResult,
  args: WriteContractParameters | SimulateContractParameters,
): Promise<Hash | undefined> {
  if (!walletClient) {
    return
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain.id),
    transport: http(),
  })
  const useSimulate = !(process.env.NEXT_PUBLIC_USE_SIMULATE === 'false')
  if (useSimulate) {
    const { request } = await publicClient.simulateContract({
      ...args,
      account: walletClient.account,
    } as SimulateContractParameters)
    const hash = await walletClient.writeContract(request)
    await publicClient.waitForTransactionReceipt({
      hash,
    })
    return hash
  } else {
    const hash = await walletClient.writeContract(
      args as WriteContractParameters,
    )
    await publicClient.waitForTransactionReceipt({
      hash,
    })
    return hash
  }
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
