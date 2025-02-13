import {
  CHAIN_IDS,
  CHART_LOG_INTERVALS,
  getContractAddresses,
  getPool,
  getPoolPerformance,
  Pool as SdkPool,
  PoolPerformanceData,
} from '@clober/v2-sdk'
import { isAddressEqual } from 'viem'

import { Pool } from '../model/pool'
import { POOL_KEY_INFOS, START_LP_INFO } from '../constants/pool'
import { Prices } from '../model/prices'
import { StackedLineData } from '../components/chart/stacked/stacked-chart-model'
import { calculateApy } from '../utils/pool-apy'

export async function fetchPools(
  chainId: CHAIN_IDS,
  prices: Prices,
): Promise<Pool[]> {
  const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000)
  const _5minNormalizedCurrentTimestampInSeconds =
    currentTimestampInSeconds - (currentTimestampInSeconds % (60 * 5))
  const _1hourNormalizedCurrentTimestampInSeconds =
    currentTimestampInSeconds - (currentTimestampInSeconds % (60 * 60))

  const pools: { pool: SdkPool; poolPerformanceData: PoolPerformanceData }[] =
    await Promise.all(
      POOL_KEY_INFOS[chainId].map(async ({ token0, token1, salt }) => {
        const pool = await getPool({
          chainId,
          token0,
          token1,
          salt,
          options: {
            useSubgraph: false,
          },
        })
        const poolPerformanceData = await getPoolPerformance({
          chainId,
          token0,
          token1,
          salt,
          // volume
          volumeFromTimestamp:
            _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
          volumeToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
          // performance chart
          snapshotFromTimestamp:
            _1hourNormalizedCurrentTimestampInSeconds - 60 * 60 * 24 * 90,
          snapshotToTimestamp: _1hourNormalizedCurrentTimestampInSeconds,
          snapshotIntervalType: CHART_LOG_INTERVALS.oneHour,
          // apy
          spreadProfitFromTimestamp:
            _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
          spreadProfitToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
          options: {
            pool,
            useSubgraph: true,
          },
        })
        return { pool, poolPerformanceData }
      }),
    )
  return pools.map(({ pool, poolPerformanceData }) => {
    const base = pool.market.base
    const quote = pool.market.quote
    const spreadProfits = poolPerformanceData.poolSpreadProfits.sort(
      (a, b) => a.timestamp - b.timestamp,
    )
    const historicalLpPrices = poolPerformanceData.poolSnapshots
      .map(({ price, liquidityA, liquidityB, totalSupply, timestamp }) => {
        const onHoldValuePerLp =
          (START_LP_INFO[chainId]!.quoteAmount +
            START_LP_INFO[chainId]!.baseAmount * Number(price)) /
          START_LP_INFO[chainId]!.lpAmount
        const usdValue = isAddressEqual(
          base.address,
          liquidityA.currency.address,
        )
          ? Number(liquidityA.value) * Number(price) + Number(liquidityB.value)
          : Number(liquidityB.value) * Number(price) + Number(liquidityA.value)
        const lpPrice =
          Number(totalSupply.value) === 0
            ? 0
            : usdValue / Number(totalSupply.value)
        return {
          lpPrice,
          time: Number(timestamp),
          pnl: lpPrice / onHoldValuePerLp,
        }
      })
      .sort((a, b) => a.time - b.time)
    const firstNonZeroIndex = historicalLpPrices.findIndex(
      ({ lpPrice }) => lpPrice > 0,
    )
    const startLpPrice =
      firstNonZeroIndex === -1
        ? 1
        : historicalLpPrices[firstNonZeroIndex].lpPrice
    const historicalPriceIndex = historicalLpPrices.map(
      ({ pnl, lpPrice, time }) => {
        return {
          values: [lpPrice !== 0 ? lpPrice / startLpPrice : 0, pnl, 0],
          time,
        }
      },
    )
    const tvl =
      (prices[pool.currencyA.address] ?? 0) *
        Number(pool.liquidityA.total.value) +
      (prices[pool.currencyB.address] ?? 0) *
        Number(pool.liquidityB.total.value)
    const totalSpreadProfit = spreadProfits.reduce(
      (acc, { accumulatedProfitInUsd }) => acc + Number(accumulatedProfitInUsd),
      0,
    )
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
      apy: calculateApy(1 + totalSpreadProfit / tvl, 60 * 60 * 24),
      volume24h: poolPerformanceData.poolVolumes.reduce(
        (acc, { currencyAVolume, currencyBVolume }) =>
          acc +
          (isAddressEqual(currencyAVolume.currency.address, quote.address)
            ? Number(currencyAVolume.value)
            : Number(currencyBVolume.value)),
        0,
      ),
      historicalPriceIndex: historicalPriceIndex.slice(
        firstNonZeroIndex,
      ) as StackedLineData[],
    }
  })
}
