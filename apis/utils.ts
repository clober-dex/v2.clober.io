import { getAddress, isAddressEqual } from 'viem'

import { Token } from '../.graphclient'
import { CHAIN_IDS } from '../constants/chain'
import { WHITELISTED_TOKENS } from '../constants/currency'

export async function fetchApi<T>(
  apiBaseUrl: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/${path}`, options)

  if (response.ok) {
    return response.json()
  } else {
    const errorResponse = await response.json()

    throw new Error(errorResponse.message || 'Unknown Error')
  }
}

export const toCurrency = (
  chainId: CHAIN_IDS,
  token: Pick<Token, 'id' | 'symbol' | 'name' | 'decimals'>,
) => {
  const currency = WHITELISTED_TOKENS[chainId].find((currency) =>
    isAddressEqual(currency.address, getAddress(token.id)),
  )
  return (
    currency || {
      address: getAddress(token.id),
      name: token.name,
      symbol: token.symbol,
      decimals: Number(token.decimals),
    }
  )
}
