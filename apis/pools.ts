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

const _dummyData = [
  {
    timestamp: '1728014400',
    price: '2372.771736203265425679627643970184',
    volume: '34.703097727006981377',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1728010800',
    price: '2365.191380695930953282084649568039',
    volume: '23.677347712224983222',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1728007200',
    price: '2372.771736203265425679627643970184',
    volume: '55.857832933367875467',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1728003600',
    price: '2377.759542827145305923797924880432',
    volume: '93.479556487073258738',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1728000000',
    price: '2341.190242533472466167462989198456',
    volume: '63.181031171827792248',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1727996400',
    price: '2350.338254114457819405955364909487',
    volume: '22.671547404446557357',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
  {
    timestamp: '1727992800',
    price: '2351.748809664674901992431561393098',
    volume: '56.074034869695927658',
    liquidityA: '7610',
    liquidityB: '2.01',
    totalSupply: '7614',
  },
]

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
