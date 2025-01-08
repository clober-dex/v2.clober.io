import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import axios from 'axios'

import { Chain } from '../chain'
import { Currency } from '../currency'
import { fetchApi } from '../../apis/utils'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'

import { Aggregator } from './index'

export class MagpieAggregator implements Aggregator {
  public readonly name = 'Magpie'
  public readonly baseUrl = 'https://api.magpiefi.xyz'
  public readonly contract: `0x${string}`
  public readonly chain: Chain
  private readonly TIMEOUT = 5000
  private readonly nativeTokenAddress = zeroAddress

  private latestQuoteId: string | undefined

  constructor(contract: `0x${string}`, chain: Chain) {
    this.contract = contract
    this.chain = chain
  }

  public async currencies(): Promise<Currency[]> {
    const { data } = (await axios.post(
      `${this.baseUrl}/token-manager/tokens`,
      {
        networkNames: [this.chain.network],
        searchValue: '',
        exact: false,
        offset: 0,
      },
      {
        timeout: this.TIMEOUT,
      },
    )) as {
      data: {
        address: string
        name: string
        symbol: string
        decimals: number
      }[]
    }

    return data.map((token) => ({
      address: getAddress(token.address),
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
    }))
  }

  public async prices(): Promise<Prices> {
    const { data } = (await axios.post(
      `${this.baseUrl}/token-manager/tokens`,
      {
        networkNames: [this.chain.network],
        searchValue: '',
        exact: false,
        offset: 0,
      },
      {
        timeout: this.TIMEOUT,
      },
    )) as {
      data: {
        address: string
        usdPrice: string
      }[]
    }

    return Object.fromEntries(
      data.map((token) => [
        getAddress(token.address),
        parseFloat(token.usdPrice),
      ]),
    )
  }

  public async quote(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress?: `0x${string}`,
  ): Promise<{
    amountOut: bigint
    gasLimit: bigint
    pathViz: PathViz | undefined
    aggregator: Aggregator
  }> {
    const response = await fetchApi<{
      id: string
      amountOut: string
      fees: {
        type: string
        value: string
      }[]
    }>(this.baseUrl, 'aggregator/quote', {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      timeout: this.TIMEOUT,
      params: {
        network: this.chain.network,
        fromTokenAddress: isAddressEqual(inputCurrency.address, zeroAddress)
          ? this.nativeTokenAddress
          : getAddress(inputCurrency.address),
        toTokenAddress: isAddressEqual(outputCurrency.address, zeroAddress)
          ? this.nativeTokenAddress
          : getAddress(outputCurrency.address),
        sellAmount: amountIn.toString(),
        slippage: slippageLimitPercent / 100,
        fromAddress: userAddress || zeroAddress,
        toAddress: userAddress || zeroAddress,
        gasless: false,
      },
    })

    this.latestQuoteId = response.id

    return {
      amountOut: BigInt(response.amountOut),
      gasLimit: 1_000_000n,
      pathViz: undefined,
      aggregator: this,
    }
  }

  public async buildCallData(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress?: `0x${string}`,
  ): Promise<{
    data: `0x${string}`
    gas: bigint
    value: bigint
    to: `0x${string}`
    nonce?: number
    gasPrice?: bigint
  }> {
    if (!this.latestQuoteId) {
      await this.quote(
        inputCurrency,
        amountIn,
        outputCurrency,
        slippageLimitPercent,
        gasPrice,
        userAddress,
      )
    }

    if (!this.latestQuoteId) {
      throw new Error('Quote ID is not defined')
    }

    const response = await fetchApi<{
      data: string
      gasLimit: string
      value: string
      to: string
    }>(this.baseUrl, 'aggregator/transaction', {
      method: 'GET',
      params: {
        quoteId: this.latestQuoteId,
        estimateGas: false,
      },
      headers: {
        accept: 'application/json',
      },
      timeout: this.TIMEOUT,
    })

    return {
      data: response.data as `0x${string}`,
      gas: BigInt(response.gasLimit),
      value: BigInt(response.value),
      to: response.to as `0x${string}`,
      gasPrice: gasPrice,
    }
  }
}
