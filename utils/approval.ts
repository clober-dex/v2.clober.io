import { createPublicClient, http } from 'viem'

import { CHAIN_IDS, supportChains } from '../constants/chain'
import { ERC721_ABI } from '../abis/@openzeppelin/erc721-abi'

export async function fetchApproval(
  chainId: CHAIN_IDS,
  nftContractAddress: `0x${string}`,
  tokenId: bigint,
): Promise<`0x${string}` | undefined> {
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const [{ result: approval }] = await publicClient.multicall({
    contracts: [
      {
        address: nftContractAddress,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [tokenId],
      },
    ],
  })
  return approval
}

export async function fetchIsApprovedForAll(
  chainId: CHAIN_IDS,
  nftContractAddress: `0x${string}`,
  owner: `0x${string}`,
  operator: `0x${string}`,
): Promise<boolean> {
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const approval = await publicClient.readContract({
    address: nftContractAddress,
    abi: ERC721_ABI,
    functionName: 'isApprovedForAll',
    args: [owner, operator],
  })
  return approval
}
