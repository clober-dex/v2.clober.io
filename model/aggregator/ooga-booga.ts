import { Chain } from 'wagmi'
import { formatUnits, isAddressEqual } from 'viem'

import { Currency } from '../currency'
import { fetchApi } from '../../apis/utils'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'

import { Aggregator } from './index'

export class OogaBoogaAggregator implements Aggregator {
  public readonly baseUrl = 'https://ooga-booga-proxy.clober.io/'
  public readonly contract: `0x${string}`
  public readonly chain: Chain

  constructor(contract: `0x${string}`, chain: Chain) {
    this.contract = contract
    this.chain = chain
  }

  public async currencies(): Promise<Currency[]> {
    const result = await fetchApi<{
      tokens: Currency[]
    }>(this.baseUrl, 'tokens')
    return result.tokens
  }

  public async prices(): Promise<Prices> {
    const result = await fetchApi<{
      prices: Prices
    }>(this.baseUrl, 'prices')
    return result.prices
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
    // const publicClient = createPublicClient({
    //   chain: this.chain,
    //   transport: http(),
    // })
    const currencies = await this.currencies()
    const { result } = await fetchApi<{
      result: any
    }>(
      this.baseUrl,
      `swap?tokenIn=${inputCurrency.address}&tokenOut=${
        outputCurrency.address
      }&amount=${amountIn.toString()}&user=${userAddress}&slippage=${
        slippageLimitPercent / 100
      }`,
    )
    // const estimatedGas = await publicClient.estimateGas({
    //   account: result['tx'].account,
    //   to: result['tx'].to,
    //   data: result['tx'].data,
    //   value: BigInt(result['tx'].value),
    // })
    const estimatedGas = 1000000n // TODO: because of berachain issue
    const pathViz = {
      nodes: result['tokens'].map((token: any) => ({
        name: token.name,
        symbol: token.symbol,
        decimals: Number(token.decimals),
        visible: true,
        width: 1,
        icon: currencies.find(
          (currency) =>
            isAddressEqual(currency.address, token.address) ||
            currency.symbol.toLowerCase() === token.symbol.toLowerCase(),
        )?.icon,
      })),
      links: result['route'].map((route: any) => ({
        source: Number(route.tokenFrom),
        target: Number(route.tokenTo),
        sourceExtend: false,
        targetExtend: false,
        sourceToken: {
          name: result['tokens'][Number(route.tokenFrom)].name,
          symbol: result['tokens'][Number(route.tokenFrom)].symbol,
          decimals: Number(result['tokens'][Number(route.tokenFrom)].decimals),
        },
        targetToken: {
          name: result['tokens'][Number(route.tokenTo)].name,
          symbol: result['tokens'][Number(route.tokenTo)].symbol,
          decimals: Number(result['tokens'][Number(route.tokenTo)].decimals),
        },
        label: route.poolName,
        value: Number(route.share) * 100, // TODO: check and modify
        nextValue: 100,
        stepValue: 100,
        in_value: formatUnits(
          BigInt(route.assumedAmountIn),
          Number(result['tokens'][Number(route.tokenFrom)].decimals),
        ),
        out_value: formatUnits(
          BigInt(route.assumedAmountOut),
          Number(result['tokens'][Number(route.tokenTo)].decimals),
        ),
        edge_len: 1,
      })),
    }
    return {
      amountOut: BigInt(result['assumedAmountOut']),
      gasLimit: estimatedGas,
      pathViz: pathViz,
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
    // const publicClient = createPublicClient({
    //   chain: this.chain,
    //   transport: http(),
    // })
    const { result } = await fetchApi<{
      result: any
    }>(
      this.baseUrl,
      `swap?tokenIn=${inputCurrency.address}&tokenOut=${
        outputCurrency.address
      }&amount=${amountIn.toString()}&user=${userAddress}&slippage=${
        slippageLimitPercent / 100
      }`,
    )
    // const estimatedGas = await publicClient.estimateGas({
    //   account: result['tx'].account,
    //   to: result['tx'].to,
    //   data: result['tx'].data,
    //   value: BigInt(result['tx'].value),
    // })
    const estimatedGas = 1000000n // TODO: because of berachain issue
    return {
      data: result['tx'].data,
      gas: estimatedGas,
      value: BigInt(result['tx'].value),
      to: result['tx'].to,
    }
  }
}
