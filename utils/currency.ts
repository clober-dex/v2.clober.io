import { createPublicClient, http, isAddressEqual, zeroAddress } from 'viem'

import { supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { Currency } from '../model/currency'
import { ETH } from '../constants/currency'

export const fetchCurrency = async (
  chainId: number,
  address: `0x${string}`,
): Promise<Currency> => {
  if (isAddressEqual(address, zeroAddress)) {
    return ETH
  }

  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(),
  })
  const [{ result: name }, { result: symbol }, { result: decimals }] =
    await publicClient.multicall({
      contracts: [
        {
          address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'name',
        },
        {
          address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'symbol',
        },
        {
          address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'decimals',
        },
      ],
    })
  return {
    address,
    name: name ?? 'Unknown',
    symbol: symbol ?? 'Unknown',
    decimals: decimals ?? 18,
  }
}
