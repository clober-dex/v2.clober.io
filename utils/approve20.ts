import { GetWalletClientResult } from '@wagmi/core'
import { createPublicClient, http } from 'viem'

import { Currency } from '../model/currency'
import { supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'

export const maxApprove = async (
  walletClient: GetWalletClientResult,
  currency: Currency,
  spender: `0x${string}`,
): Promise<`0x${string}` | undefined> => {
  if (!walletClient) {
    return
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === walletClient.chain.id),
    transport: http(),
  })
  const hash = await walletClient.writeContract({
    address: currency.address,
    abi: ERC20_PERMIT_ABI,
    functionName: 'approve',
    args: [spender, 2n ** 256n - 1n],
    account: walletClient.account,
  })
  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}
