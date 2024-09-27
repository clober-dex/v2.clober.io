import { CHAIN_IDS, getChartLogs, getLatestChartLog } from '@clober/v2-sdk'

import {
  Bar,
  DatafeedConfiguration,
  HistoryCallback,
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from '../public/static/charting_library'
import { Currency } from '../model/currency'

import { SUPPORTED_INTERVALS } from './chart'
import { getPriceDecimals } from './prices'

const configurationData: Partial<DatafeedConfiguration> &
  Required<
    Pick<
      DatafeedConfiguration,
      'supported_resolutions' | 'exchanges' | 'symbols_types'
    >
  > = {
  supported_resolutions: SUPPORTED_INTERVALS.map(
    (interval) => interval[0],
  ) as ResolutionString[],
  exchanges: [
    {
      value: 'Clober',
      name: 'Clober',
      desc: 'Clober',
    },
  ],
  symbols_types: [
    {
      name: 'crypto',
      // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
      value: 'crypto',
    },
  ],
}

export default class DataFeed implements IBasicDataFeed {
  private chainId: CHAIN_IDS
  private baseCurrency: Currency
  private quoteCurrency: Currency

  constructor(
    chainId: CHAIN_IDS,
    baseCurrency: Currency,
    quoteCurrency: Currency,
  ) {
    this.chainId = chainId
    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency
  }

  onReady(callback: OnReadyCallback) {
    console.log('[onReady]: Method call')
    setTimeout(() => callback(configurationData))
  }

  async searchSymbols(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userInput: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exchange: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbolType: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResult: SearchSymbolsCallback,
  ) {
    console.log('[searchSymbols]: Method call')
  }

  async resolveSymbol(symbolName: string, onResolve: ResolveCallback) {
    console.log('[resolveSymbol]: Method call', symbolName)
    const { close } = await getLatestChartLog({
      chainId: this.chainId.valueOf(),
      base: this.baseCurrency.address,
      quote: this.quoteCurrency.address,
    })
    if (close === '0') {
      console.error('cannot resolve symbol')
      return
    }
    const priceDecimal = getPriceDecimals(Number(close)) + 1
    onResolve({
      name: symbolName, // display name for users
      ticker: symbolName,
      full_name: symbolName,
      description: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'Clober',
      minmov: 1,
      pricescale: 10 ** priceDecimal,
      listed_exchange: 'Clober',
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false, // has weekly data
      visible_plots_set: 'ohlcv',
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
      format: 'price',
    } as LibrarySymbolInfo)
  }

  async getBars(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
  ) {
    try {
      const { from, to } = periodParams
      console.log(
        '[getBars]: Method call',
        symbolInfo.name,
        resolution,
        from,
        to,
      )
      if (to === 0) {
        onResult([], {
          noData: true,
        })
        return
      }
      const resolutionKey = (SUPPORTED_INTERVALS.find(
        (interval) => interval[0] === resolution,
      ) || SUPPORTED_INTERVALS[0])[1]

      const chartLogs = (
        await getChartLogs({
          chainId: this.chainId.valueOf(),
          quote: this.quoteCurrency.address,
          base: this.baseCurrency.address,
          intervalType: resolutionKey,
          from,
          to,
        })
      ).filter((v) => Number(v.close) > 0 && Number(v.open) > 0)
      if (chartLogs.length === 0) {
        onResult([], {
          noData: true,
        })
        return
      }

      const bars = chartLogs.map<Bar>((v, index) => ({
        time: Number(v.timestamp) * 1000,
        open: Number(index === 0 ? v.open : chartLogs[index - 1].close),
        high: Number(v.high),
        low: Number(v.low),
        close: Number(v.close),
        volume: Number(v.volume),
      }))

      onResult(bars, {
        noData: false,
      })
    } catch (error) {
      console.error((error as Error).message)
    }
  }

  subscribeBars(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    symbolInfo: LibrarySymbolInfo,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolution: ResolutionString,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTick: SubscribeBarsCallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    listenerGuid: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onResetCacheNeededCallback: () => void,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unsubscribeBars(listenerGuid: string) {}
}
