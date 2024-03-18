import { GetWalletClientResult, readContracts } from '@wagmi/core'
import { hexToSignature, verifyTypedData, zeroHash } from 'viem'

import { Currency } from '../model/currency'
import { fetchAllowance } from '../apis/allowance'
import { CHAIN_IDS } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'

import { approve20 } from './approve20'

export const dummyPermit20Params = {
  permitAmount: 0n,
  signature: {
    r: zeroHash,
    s: zeroHash,
    v: 0,
    deadline: 0n,
  },
}

export const permit20 = async (
  chainId: CHAIN_IDS,
  walletClient: GetWalletClientResult,
  currency: Currency,
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint,
): Promise<{
  r: `0x${string}`
  s: `0x${string}`
  v: number
  deadline: bigint
}> => {
  if (!walletClient || value === 0n) {
    return dummyPermit20Params.signature
  }

  const allowance = await fetchAllowance(chainId, currency, owner, spender)
  if (allowance >= value) {
    return dummyPermit20Params.signature
  }

  const [{ result: nonce }, { result: version }, { result: name }] =
    await readContracts({
      allowFailure: true,
      contracts: [
        {
          address: currency.address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'nonces',
          args: [owner],
        },
        {
          address: currency.address,
          abi: [
            {
              inputs: [],
              name: 'version',
              outputs: [
                {
                  internalType: 'string',
                  name: '',
                  type: 'string',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ] as const,
          functionName: 'version',
        },
        {
          address: currency.address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'name',
        },
      ],
    })

  if (nonce === undefined || !name) {
    await approve20(
      chainId,
      walletClient,
      currency,
      walletClient.account.address,
      spender,
      value,
    )
    return dummyPermit20Params.signature
  }
  const data = {
    domain: {
      name: name,
      version: (version || '1').toString(),
      chainId: BigInt(walletClient.chain.id),
      verifyingContract: currency.address,
    },
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
    primaryType: 'Permit',
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
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
