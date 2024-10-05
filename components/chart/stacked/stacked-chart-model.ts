/**
 * Copied and modified from: https://github.com/Uniswap/interface/tree/main/apps/web/src/components/Charts/StackedLineChart
 * Modifications are called out with comments.
 */

import {
  CustomStyleOptions,
  DeepPartial,
  ISeriesApi,
  Logical,
  UTCTimestamp,
  WhitespaceData,
} from 'lightweight-charts'

import { ChartModel, ChartModelParams } from '../chart-model'

import { StackedAreaSeriesOptions } from './area/stacked-area-options'
import { StackedAreaSeries } from './area/stacked-area-series'

export interface StackedLineData extends WhitespaceData<UTCTimestamp> {
  values: number[]
}

interface StackedChartParams extends ChartModelParams<StackedLineData> {
  colors: string[]
  gradients?: { start: string; end: string }[]
}

export class StackedChartModel extends ChartModel<StackedLineData> {
  protected series: ISeriesApi<'Custom'>

  private hoveredLogicalIndex: Logical | null | undefined

  constructor(chartDiv: HTMLDivElement, params: StackedChartParams) {
    super(chartDiv, params)

    this.series = this.api.addCustomSeries(
      new StackedAreaSeries(),
      {} as DeepPartial<CustomStyleOptions>,
    )

    this.series.setData(this.data)
    this.updateOptions(params)
    this.fitContent()

    this.api.subscribeCrosshairMove((param) => {
      if (param?.logical !== this.hoveredLogicalIndex) {
        this.hoveredLogicalIndex = param?.logical
        this.series.applyOptions({
          hoveredLogicalIndex: this.hoveredLogicalIndex ?? (-1 as Logical), // -1 is used because series will use prev value if undefined is passed
        } as DeepPartial<StackedAreaSeriesOptions>)
      }
    })
  }

  updateOptions(params: StackedChartParams) {
    const isSingleLineChart = params.colors.length === 1

    const gridSettings = isSingleLineChart
      ? {
          grid: {
            vertLines: { style: 5, color: '#BFBFBF' },
            horzLines: { style: 5, color: '#BFBFBF' },
          },
        }
      : {}

    super.updateOptions(params, {
      handleScale: false,
      handleScroll: false,
      rightPriceScale: {
        visible: isSingleLineChart, // Hide pricescale on multi-line charts
        borderVisible: false,
        scaleMargins: {
          top: 0.25,
          bottom: 0,
        },
        autoScale: true,
      },
      ...gridSettings,
    })
    const { data, colors, gradients } = params

    // Handles changes in data, e.g. time period selection
    if (this.data !== data) {
      this.data = data
      this.series.setData(data)
      this.fitContent()
    }

    this.series.applyOptions({
      priceLineVisible: false,
      lastValueVisible: false,
      colors,
      gradients,
      lineWidth: 2.5,
    } as DeepPartial<StackedAreaSeriesOptions>)
  }
}
