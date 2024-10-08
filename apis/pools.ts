import {
  CHAIN_IDS,
  getContractAddresses,
  getPool,
  Pool as SdkPool,
} from '@clober/v2-sdk'

import { Pool } from '../model/pool'
import { POOL_KEY_INFOS, START_LP_PRICE } from '../constants/pool'
import { RPC_URL } from '../constants/rpc-urls'
import { Prices } from '../model/prices'
import { StackedLineData } from '../components/chart/stacked/stacked-chart-model'

const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000)
const todayTimestampInSeconds =
  currentTimestampInSeconds - (currentTimestampInSeconds % (24 * 60 * 60))
const _dummyData = Array.from({ length: 33 }, (_, i) => {
  return {
    timestamp: todayTimestampInSeconds - i * 24 * 60 * 60,
    price: (2377 - i).toString(),
    volume: '93.479556487073258738',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  }
})

export async function fetchHistoricalPriceIndex(
  chainId: CHAIN_IDS,
): Promise<StackedLineData[]> {
  return (
    _dummyData.map(
      ({ liquidityA, liquidityB, price, totalSupply, timestamp }) => {
        const usdValue = Number(liquidityA) + Number(liquidityB) * Number(price)
        const lpPrice = usdValue / Number(totalSupply)
        return {
          values: [lpPrice / START_LP_PRICE[chainId], 0],
          time: Number(timestamp),
        }
      },
    ) as StackedLineData[]
  ).sort((a, b) => a.time - b.time)
}

export async function fetchPools(
  chainId: CHAIN_IDS,
  prices: Prices,
): Promise<Pool[]> {
  const pools: SdkPool[] = await Promise.all(
    POOL_KEY_INFOS[chainId].map(({ token0, token1, salt }) => {
      return getPool({
        chainId,
        token0,
        token1,
        salt,
        options: {
          useSubgraph: false,
          rpcUrl: RPC_URL[chainId],
        },
      })
    }),
  )
  return pools.map((pool) => {
    const tvl =
      (prices[pool.currencyA.address] ?? 0) *
        Number(pool.liquidityA.total.value) +
      (prices[pool.currencyB.address] ?? 0) *
        Number(pool.liquidityA.total.value)
    return {
      key: pool.key,
      lpCurrency: {
        address: getContractAddresses({ chainId }).Rebalancer,
        name: `Clober LP ${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        symbol: `${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        decimals: 18,
      },
      lpUsdValue: tvl / Number(pool.totalSupply.value),
      currency0: pool.currencyA,
      currency1: pool.currencyB,
      reserve0: Number(pool.liquidityA.total.value),
      reserve1: Number(pool.liquidityB.total.value),
      tvl,
      // TODO
      apy: 69696969,
      volume24h: 69696969,
    }
  })
}
