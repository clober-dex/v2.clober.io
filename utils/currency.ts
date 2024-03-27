import { createPublicClient, http, isAddressEqual, zeroAddress } from 'viem'

import { supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { Currency } from '../model/currency'
import { ETH, WHITELISTED_CURRENCIES } from '../constants/currency'

export const fetchCurrency = async (
  chainId: number,
  address: `0x${string}`,
): Promise<Currency> => {
  if (isAddressEqual(address, zeroAddress)) {
    return ETH
  }
  const currency = WHITELISTED_CURRENCIES[chainId].find((c) =>
    isAddressEqual(c.address, address),
  )
  if (currency) {
    return currency
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

export const isCurrencyEqual = (a: Currency, b: Currency) => {
  return (
    isAddressEqual(a.address, b.address) &&
    a.decimals === b.decimals &&
    a.name === b.name &&
    a.symbol === b.symbol
  )
}
