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
}: {
  historicalPriceIndex: StackedLineData[]
}) => {
  const lastEntry = historicalPriceIndex[historicalPriceIndex.length - 1]
  const params = useMemo(
    () => ({
      data: historicalPriceIndex,
      colors: ['#4C82FB', '#FC72FF'],
      gradients: [
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
    [historicalPriceIndex],
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
              const value = (
                (crosshairData ?? lastEntry) as any
              )?.values.reduce((v: number, sum: number) => (sum += v), 0)
              return (
                <ChartHeader
                  value={`${Number(value) > 0 ? '+' : ''}${value.toFixed(4)}%`}
                  time={crosshairData?.time as any}
                  detailData={[{ label: 'Index', color: '#4C82FB' }].map(
                    ({ label, color }, index) => {
                      const value = (crosshairData as any)?.values[index] ?? 0
                      return {
                        label,
                        color,
                        value: `${Number(value) > 0 ? '+' : ''}${value.toFixed(
                          4,
                        )}%`,
                      }
                    },
                  )}
                />
              )
            }}
          </Chart>
        )
      })()}
    </TamaguiProvider>
  )
}
