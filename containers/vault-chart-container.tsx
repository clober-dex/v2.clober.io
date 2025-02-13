import React, { useMemo } from 'react'
import { TamaguiProvider } from '@tamagui/web'

import { Chart } from '../components/chart/chart-model'
import {
  StackedChartModel,
  StackedLineData,
} from '../components/chart/stacked/stacked-chart-model'
import tamaguiConfig from '../tamagui.config'
import { ChartHeader } from '../components/chart/chart-header'

export const VaultChartContainer = ({
  historicalPriceIndex,
  advancedMode,
}: {
  historicalPriceIndex: StackedLineData[]
  advancedMode: boolean
}) => {
  const lastEntry = historicalPriceIndex[historicalPriceIndex.length - 1]
  const params = useMemo(
    () => ({
      data: historicalPriceIndex.map((entry) => ({
        time: entry.time,
        values: advancedMode ? entry.values : [entry.values[0], 0],
      })),
      colors: ['#4C82FB', '#4C82FB', '#FC72FF'],
      gradients: [
        {
          start: 'rgba(252, 116, 254, 0.20)',
          end: 'rgba(252, 116, 254, 0.00)',
        },
        {
          start: 'rgba(96, 123, 238, 0.20)',
          end: 'rgba(55, 70, 136, 0.00)',
        },
        {
          start: 'rgba(252, 116, 254, 0.20)',
          end: 'rgba(252, 116, 254, 0.00)',
        },
      ],
    }),
    [advancedMode, historicalPriceIndex],
  )

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      disableInjectCSS
      disableRootThemeClass
    >
      {(() => {
        return (
          <Chart Model={StackedChartModel} params={params as any} height={368}>
            {(crosshairData) => {
              const value =
                ((crosshairData ?? lastEntry) as any)?.values[0] ?? 0
              return (
                <ChartHeader
                  value={`${value.toFixed(4)}`}
                  time={crosshairData?.time as any}
                  detailData={
                    advancedMode
                      ? [
                          {
                            label: 'Index',
                            color: '#FC72FF',
                            value: `${(
                              (crosshairData as any)?.values[0] ?? 0
                            ).toFixed(4)}`,
                          },
                          {
                            label: 'RPI',
                            color: '#4C82FB',
                            value: `${(
                              (crosshairData as any)?.values[1] ?? 0
                            ).toFixed(4)}`,
                          },
                        ]
                      : [
                          {
                            label: 'Index',
                            color: '#4C82FB',
                            value: `${(
                              (crosshairData as any)?.values[0] ?? 0
                            ).toFixed(4)}`,
                          },
                        ]
                  }
                />
              )
            }}
          </Chart>
        )
      })()}
    </TamaguiProvider>
  )
}
