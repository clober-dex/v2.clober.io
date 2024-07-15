import {
  createPublicClient,
  getAddress,
  http,
  isAddressEqual,
  zeroAddress,
} from 'viem'

import { findSupportChain, supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { Currency } from '../model/currency'
import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
  ETH,
} from '../constants/currency'
import { Chain } from '../model/chain'
import { fetchApi } from '../apis/utils'

export const LOCAL_STORAGE_INPUT_CURRENCY_KEY = (
  context: string,
  chain: Chain,
) => `${chain.id}-inputCurrency-${context}`
export const LOCAL_STORAGE_OUTPUT_CURRENCY_KEY = (
  context: string,
  chain: Chain,
) => `${chain.id}-outputCurrency-${context}`
export const QUERY_PARAM_INPUT_CURRENCY_KEY = 'inputCurrency'
export const QUERY_PARAM_OUTPUT_CURRENCY_KEY = 'outputCurrency'

const currencyCache: {
  [key: string]: Currency[]
} = {}
const getCurrencyCacheKey = (chainId: number, name: string) =>
  `${chainId}-${name.toLowerCase()}`

let fetchCurrencyJobId: NodeJS.Timeout | null = null
let fetchCurrencyJobResult: Currency[] = []
let fetchCurrencyJobResultCode: number = 0

export const deduplicateCurrencies = (currencies: Currency[]) => {
  return currencies
    .sort((a, b) => (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0))
    .filter(
      (currency, index, self) =>
        self.findIndex((c) => isAddressEqual(c.address, currency.address)) ===
        index,
    )
}

export const fetchCurrency = async (
  chainId: number,
  address: `0x${string}`,
): Promise<Currency | undefined> => {
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
  if (!name || !symbol || !decimals) {
    return undefined
  }

  return {
    address,
    name: name,
    symbol: symbol,
    decimals: decimals,
  }
}

export const fetchCurrenciesByName = async (
  chainId: number,
  name: string,
): Promise<Currency[]> => {
  if (fetchCurrencyJobId) {
    clearTimeout(fetchCurrencyJobId)
    fetchCurrencyJobId = null
  }
  const previousCode = fetchCurrencyJobResultCode
  // @ts-ignore
  fetchCurrencyJobId = setTimeout(async () => {
    fetchCurrencyJobResult = await fetchCurrencyByNameImpl(chainId, name)
    fetchCurrencyJobResultCode = Math.random()
  }, 500)

  while (fetchCurrencyJobResultCode === previousCode) {
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  return fetchCurrencyJobResult
}

export const fetchCurrencyByNameImpl = async (
  chainId: number,
  name: string,
): Promise<Currency[]> => {
  const chain = findSupportChain(chainId)
  if (!chain) {
    return []
  }

  const cacheKey = getCurrencyCacheKey(chainId, name)
  if (currencyCache[cacheKey] !== undefined) {
    return currencyCache[cacheKey]
  }

  try {
    const searchResult = (await fetchApi<any>(
      'https://api.dexscreener.com',
      `latest/dex/search?q=${name}`,
    )) as any
    const pairs = (searchResult.pairs ?? []) as any[]
    const candidateTokens: {
      [key: `0x${string}`]: number
    } = {}
    for (const pair of pairs) {
      const chainName = (pair.chainId as string).split('-')[0]
      if (chainName !== chain.network) {
        continue
      }

      const baseToken = pair.baseToken as any
      const quoteToken = pair.quoteToken as any
      for (const token of [baseToken, quoteToken]) {
        if (
          (token.symbol as string).toLowerCase().includes(name.toLowerCase()) ||
          (token.name as string).toLowerCase().includes(name.toLowerCase())
        ) {
          candidateTokens[token.address as `0x${string}`] =
            (candidateTokens[token.address as `0x${string}`] ?? 0) +
            (pair.volume.h24 as number)
        }
      }
    }

    const addresses = (Object.keys(candidateTokens) as `0x${string}`[]).sort(
      (a, b) => candidateTokens[b] - candidateTokens[a],
    )
    const tokens = (
      await Promise.all(
        addresses.map((address) => fetchCurrency(chainId, address)),
      )
    ).filter((token) => token !== undefined) as Currency[]
    currencyCache[cacheKey] = tokens
    return tokens
  } catch (e) {
    return []
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

export const fetchCurrenciesDone = (currencies: Currency[], chain: Chain) => {
  return (
    currencies.find((currency) =>
      isAddressEqual(
        currency.address,
        getAddress(DEFAULT_INPUT_CURRENCY[chain.id].address),
      ),
    ) &&
    currencies.find((currency) =>
      isAddressEqual(
        currency.address,
        getAddress(DEFAULT_OUTPUT_CURRENCY[chain.id].address),
      ),
    )
  )
}

export const getCurrencyAddress = (context: string, chain: Chain) => {
  const params = new URLSearchParams(window.location.search)
  const queryParamInputCurrencyAddress = params.get(
    QUERY_PARAM_INPUT_CURRENCY_KEY,
  )
  const queryParamOutputCurrencyAddress = params.get(
    QUERY_PARAM_OUTPUT_CURRENCY_KEY,
  )
  const localStorageInputCurrencyAddress = localStorage.getItem(
    LOCAL_STORAGE_INPUT_CURRENCY_KEY(context, chain),
  )
  const localStorageOutputCurrencyAddress = localStorage.getItem(
    LOCAL_STORAGE_OUTPUT_CURRENCY_KEY(context, chain),
  )
  const inputCurrencyAddress =
    queryParamInputCurrencyAddress ||
    localStorageInputCurrencyAddress ||
    undefined
  const outputCurrencyAddress =
    queryParamOutputCurrencyAddress ||
    localStorageOutputCurrencyAddress ||
    undefined
  return {
    inputCurrencyAddress,
    outputCurrencyAddress,
  }
}
