import { GetWalletClientResult } from '@wagmi/core'

import { Currency } from '../model/currency'
import { CHAIN_IDS } from '../constants/chain'
import { fetchAllowance } from '../apis/allowance'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'

export const approve20 = async (
  chainId: CHAIN_IDS,
  walletClient: GetWalletClientResult,
  currency: Currency,
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
): Promise<`0x${string}` | undefined> => {
  const allowance = await fetchAllowance(chainId, currency, owner, spender)
  if (!walletClient || allowance >= value) {
    return
  }
  return walletClient.writeContract({
    address: currency.address,
    abi: ERC20_PERMIT_ABI,
    functionName: 'approve',
    args: [spender, value],
    account: walletClient.account,
  })
}
