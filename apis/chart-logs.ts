import { getBuiltGraphSDK } from '../.graphclient'
import { CHAIN_IDS } from '../constants/chain'
import { SUBGRAPH_URL } from '../constants/subgraph-url'
import { ChartLog } from '../model/chart-log'

const { getChartLogs, getLatestChartLog } = getBuiltGraphSDK()

export enum CHART_LOG_INTERVALS {
  oneMinute = '1m',
  threeMinutes = '3m',
  fiveMinutes = '5m',
  tenMinutes = '10m',
  fifteenMinutes = '15m',
  thirtyMinutes = '30m',
  oneHour = '1h',
  twoHours = '2h',
  fourHours = '4h',
  sixHours = '6h',
  oneDay = '1d',
  oneWeek = '1w',
}

export const CHART_LOG_INTERVAL_TIMESTAMP: {
  [key in CHART_LOG_INTERVALS]: number
} = {
  [CHART_LOG_INTERVALS.oneMinute]: 60,
  [CHART_LOG_INTERVALS.threeMinutes]: 3 * 60,
  [CHART_LOG_INTERVALS.fiveMinutes]: 5 * 60,
  [CHART_LOG_INTERVALS.tenMinutes]: 10 * 60,
  [CHART_LOG_INTERVALS.fifteenMinutes]: 15 * 60,
  [CHART_LOG_INTERVALS.thirtyMinutes]: 30 * 60,
  [CHART_LOG_INTERVALS.oneHour]: 60 * 60,
  [CHART_LOG_INTERVALS.twoHours]: 2 * 60 * 60,
  [CHART_LOG_INTERVALS.fourHours]: 4 * 60 * 60,
  [CHART_LOG_INTERVALS.sixHours]: 6 * 60 * 60,
  [CHART_LOG_INTERVALS.oneDay]: 24 * 60 * 60,
  [CHART_LOG_INTERVALS.oneWeek]: 7 * 24 * 60 * 60,
}

const PAGE_SIZE = 1000

export async function fetchLatestChartLog(
  chainId: CHAIN_IDS,
  marketCode: string,
): Promise<ChartLog> {
  const { chartLogs } = await getLatestChartLog(
    {
      marketCode: marketCode.toLowerCase(),
    },
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  return chartLogs.length > 0
    ? {
        timestamp: Number(chartLogs[0].timestamp),
        open: String(chartLogs[0].open),
        high: String(chartLogs[0].high),
        low: String(chartLogs[0].low),
        close: String(chartLogs[0].close),
        baseVolume: String(chartLogs[0].baseVolume),
      }
    : {
        timestamp: Number(0),
        open: '0',
        high: '0',
        low: '0',
        close: '0',
        baseVolume: '0',
      }
}

export async function fetchChartLogs(
  chainId: CHAIN_IDS,
  marketCode: string,
  intervalType: CHART_LOG_INTERVALS,
  from: number,
  to: number,
): Promise<ChartLog[]> {
  const chartLogsBetweenFromAndTo: ChartLog[] = []
  let skip = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { chartLogs } = await getChartLogs(
      {
        first: PAGE_SIZE,
        skip,
        marketCode: marketCode.toLowerCase(),
        intervalType,
        from,
        to,
      },
      {
        url: SUBGRAPH_URL[chainId],
      },
    )
    chartLogsBetweenFromAndTo.push(
      ...chartLogs.map((chartLog) => {
        return {
          timestamp: Number(chartLog.timestamp),
          open: String(chartLog.open),
          high: String(chartLog.high),
          low: String(chartLog.low),
          close: String(chartLog.close),
          baseVolume: String(chartLog.baseVolume),
        }
      }),
    )
    if (chartLogs.length < PAGE_SIZE) {
      break
    }
    skip += PAGE_SIZE
  }
  chartLogsBetweenFromAndTo.sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  )
  const { chartLogs: chartLogsBeforeFrom } = await getChartLogs(
    {
      first: 1,
      skip: 0,
      marketCode: marketCode.toLowerCase(),
      intervalType,
      from: 0,
      to: from - 1,
    },
    {
      url: SUBGRAPH_URL[chainId],
    },
  )
  let previousChartLog =
    chartLogsBeforeFrom[0] !== undefined
      ? {
          timestamp: Number(chartLogsBeforeFrom[0].timestamp),
          open: String(chartLogsBeforeFrom[0].open),
          high: String(chartLogsBeforeFrom[0].high),
          low: String(chartLogsBeforeFrom[0].low),
          close: String(chartLogsBeforeFrom[0].close),
          baseVolume: String(chartLogsBeforeFrom[0].baseVolume),
        }
      : {
          timestamp: 0n,
          open: '0',
          high: '0',
          low: '0',
          close: '0',
          baseVolume: '0',
        }
  const intervalInNumber = CHART_LOG_INTERVAL_TIMESTAMP[intervalType]
  const fromTimestampForAcc =
    Math.floor(from / intervalInNumber) * intervalInNumber
  const toTimestampForAcc = Math.floor(to / intervalInNumber) * intervalInNumber

  let timestampForAcc = fromTimestampForAcc
  let result: ChartLog[] = []
  while (timestampForAcc <= toTimestampForAcc) {
    const currentChartLog = chartLogsBetweenFromAndTo.find(
      (v) => v.timestamp === timestampForAcc,
    )

    if (currentChartLog) {
      result = [
        ...result,
        {
          timestamp: currentChartLog.timestamp,
          open: previousChartLog.close,
          high: currentChartLog.high,
          low: currentChartLog.low,
          close: currentChartLog.close,
          baseVolume: currentChartLog.baseVolume,
        },
      ]
      previousChartLog = currentChartLog
    } else {
      result = [
        ...result,
        {
          timestamp: timestampForAcc,
          open: previousChartLog.close,
          high: previousChartLog.close,
          low: previousChartLog.close,
          close: previousChartLog.close,
          baseVolume: '0',
        },
      ]
    }

    timestampForAcc += intervalInNumber
  }

  return result
}
