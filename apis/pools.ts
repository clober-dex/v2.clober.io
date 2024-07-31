import {
  CHAIN_IDS,
  getContractAddresses,
  getPool,
  Pool as SdkPool,
} from '@clober/v2-sdk'

import { Pool } from '../model/pool'
import { POOL_KEY_INFOS } from '../constants/pool'

export async function fetchPools(chainId: CHAIN_IDS): Promise<Pool[]> {
  const pools: SdkPool[] = await Promise.all(
    POOL_KEY_INFOS[chainId].map(({ token0, token1, salt }) => {
      return getPool({
        chainId,
        token0,
        token1,
        salt,
        options: {
          useSubgraph: false,
        },
      })
    }),
  )
  return pools.map((pool) => {
    return {
      lpCurrency: {
        address: getContractAddresses({ chainId }).Rebalancer,
        name: `Clober LP ${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        symbol: `${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        decimals: 18,
      },
      currency0: pool.currencyA,
      currency1: pool.currencyB,
      // TODO
      apy: 69.69,
      tvl: 69.69,
      volume24h: 69.69,
      reserve0: Number(pool.reserveA),
      reserve1: Number(pool.reserveB),
    }
  })
}
