import { GetWalletClientResult, readContracts } from '@wagmi/core'
import {
  hexToSignature,
  isAddressEqual,
  verifyTypedData,
  zeroAddress,
  zeroHash,
} from 'viem'

import { CHAIN_IDS } from '../constants/chain'
import { ERC721_PERMIT_ABI } from '../abis/core/libraries/erc721-permit-abi'
import { EIP712_ABI } from '../abis/@openzeppelin/eip712-abi'

import { fetchApproval } from './approval'

export const permit721 = async (
  chainId: CHAIN_IDS,
  walletClient: GetWalletClientResult,
  nftContractAddress: `0x${string}`,
  tokenId: bigint,
  owner: `0x${string}`,
  spender: `0x${string}`,
  deadline: bigint,
): Promise<{
  r: `0x${string}`
  s: `0x${string}`
  v: number
  deadline: bigint
}> => {
  const approval = await fetchApproval(chainId, nftContractAddress, tokenId)
  if (!walletClient || isAddressEqual(approval || zeroAddress, spender)) {
    return {
      r: zeroHash as `0x${string}`,
      s: zeroHash as `0x${string}`,
      v: 0,
      deadline: 0n,
    }
  }

  const [{ result: nonce }, { result: eip712Domain }] = await readContracts({
    allowFailure: true,
    contracts: [
      {
        address: nftContractAddress,
        abi: ERC721_PERMIT_ABI,
        functionName: 'nonces',
        args: [tokenId],
      },
      {
        address: nftContractAddress,
        abi: EIP712_ABI,
        functionName: 'eip712Domain',
      },
    ],
  })

  if (nonce === undefined || !eip712Domain) {
    throw new Error('Could not fetch eip712Domain')
  }

  const data = {
    domain: {
      name: eip712Domain[1],
      version: eip712Domain[2].toString(),
      chainId: BigInt(walletClient.chain.id),
      verifyingContract: nftContractAddress,
    },
    message: {
      spender,
      tokenId,
      nonce,
      deadline,
    },
    primaryType: 'Permit',
    types: {
      Permit: [
        { name: 'spender', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
    },
  } as const
  const signature = await walletClient.signTypedData({
    ...data,
    account: owner,
  })
  const valid = await verifyTypedData({ ...data, signature, address: owner })
  if (!valid) {
    throw new Error('Invalid signature')
  }

  const { v, s, r } = hexToSignature(signature)
  return {
    v: Number(v),
    s: s as `0x${string}`,
    r: r as `0x${string}`,
    deadline,
  }
}
