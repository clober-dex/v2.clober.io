import { createPublicClient, http, isAddressEqual, zeroAddress } from 'viem'

import { Currency } from '../model/currency'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { CHAIN_IDS, supportChains } from '../constants/chain'

export const calculateUnit = async (chainId: CHAIN_IDS, quote: Currency) => {
  if (isAddressEqual(quote.address, zeroAddress)) {
    return 1n
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const [{ result: totalSupply }] = await publicClient.multicall({
    contracts: [
      {
        address: quote.address,
        abi: ERC20_PERMIT_ABI,
        functionName: 'totalSupply',
      },
    ],
  })
  if (!totalSupply) {
    throw new Error('totalSupply is not found')
  }
  return totalSupply <= 2n ** 64n
    ? 1n
    : 10n ** BigInt(Math.max(quote.decimals - 6, 0))
}
