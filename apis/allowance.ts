import { createPublicClient, http } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../model/currency'
import { supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'

export async function fetchAllowance(
  chainId: CHAIN_IDS,
  currency: Currency,
  userAddress: `0x${string}`,
  spenderAddress: `0x${string}`,
): Promise<bigint> {
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const [{ result: allowance }] = await publicClient.multicall({
    contracts: [
      {
        address: currency.address,
        abi: ERC20_PERMIT_ABI,
        functionName: 'allowance',
        args: [userAddress, spenderAddress],
      },
    ],
  })
  return allowance || 0n
}
