import { GetWalletClientResult } from '@wagmi/core'
import { createPublicClient, Hash, http } from 'viem'
import { setApprovalOfOpenOrdersForAll as setApprovalOfOpenOrdersForAllInSdk } from '@clober/v2-sdk'

import { supportChains } from '../constants/chain'
import { RPC_URL } from '../constants/rpc-urls'

export async function setApprovalOfOpenOrdersForAll(
  walletClient: GetWalletClientResult,
): Promise<Hash | undefined> {
  if (!walletClient) {
    return
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain.id),
    transport: http(),
  })
  const hash = await setApprovalOfOpenOrdersForAllInSdk({
    chainId: walletClient.chain.id,
    walletClient: walletClient as any,
    options: {
      rpcUrl: RPC_URL[walletClient.chain.id],
    },
  })
  if (hash) {
    await publicClient.waitForTransactionReceipt({
      hash,
    })
  }
  return hash
}
