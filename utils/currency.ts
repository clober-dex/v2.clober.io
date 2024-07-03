import {
  createPublicClient,
  getAddress,
  http,
  isAddressEqual,
  zeroAddress,
} from 'viem'

import { supportChains } from '../constants/chain'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { Currency } from '../model/currency'
import {
  DEFAULT_INPUT_CURRENCY,
  DEFAULT_OUTPUT_CURRENCY,
  ETH,
} from '../constants/currency'
import { Chain } from '../model/chain'

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
