import {
  CHAIN_IDS,
  getContractAddresses,
  getPool,
  Pool as SdkPool,
} from '@clober/v2-sdk'

import { Pool } from '../model/pool'
import { POOL_KEY_INFOS } from '../constants/pool'
import { RPC_URL } from '../constants/rpc-urls'
import { Prices } from '../model/prices'

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
    return {
      key: pool.key,
      lpCurrency: {
        address: getContractAddresses({ chainId }).Rebalancer,
        name: `Clober LP ${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        symbol: `${pool.currencyA.symbol}/${pool.currencyB.symbol}`,
        decimals: 18,
      },
      currency0: pool.currencyA,
      currency1: pool.currencyB,
      reserve0: Number(pool.reserveA),
      reserve1: Number(pool.reserveB),
      tvl:
        (prices[pool.currencyA.address] ?? 0) * Number(pool.reserveA) +
        (prices[pool.currencyB.address] ?? 0) * Number(pool.reserveB),
      // TODO
      apy: 69696969,
      volume24h: 69696969,
    }
  })
}
