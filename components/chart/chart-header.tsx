/**
 * Copied and modified from: https://github.com/Uniswap/interface/blob/main/apps/web/src/components/Charts/ChartHeader.tsx
 * Modifications are called out with comments.
 */

import React, { ReactElement, ReactNode } from 'react'
import { View } from '@tamagui/core'
import { UTCTimestamp } from 'lightweight-charts'

import { useHeaderDateFormatter } from '../../hooks/useHeaderDateFormatter'

import { Legend, LegendInfo } from './legend'

interface HeaderTimeDisplayProps {
  time?: UTCTimestamp
  /** Optional string to display when time is undefined */
  timePlaceholder?: string
}

function HeaderTimeDisplay({ time, timePlaceholder }: HeaderTimeDisplayProps) {
  const headerDateFormatter = useHeaderDateFormatter()
  return (
    <span className="text-sm text-gray-500 font-semibold">
      {time ? headerDateFormatter(time) : timePlaceholder}
    </span>
  )
}

interface HeaderValueDisplayProps {
  /** The number to be formatted and displayed, or the ReactElement to be displayed */
  value?: number | ReactElement
}

interface ChartHeaderProps
  extends HeaderValueDisplayProps,
    HeaderTimeDisplayProps {
  detailData?: LegendInfo[]
  additionalFields?: ReactNode
}

export function ChartHeader({
  value,
  time,
  timePlaceholder,
  additionalFields,
  detailData,
}: ChartHeaderProps) {
  const isHovered = !!time

  return (
    <View
      position="absolute"
      width="100%"
      alignItems="flex-start"
      animation="fast"
      id="chart-header"
    >
      <div className="absolute pointer-events-none w-[70%]">
        <span className="text-xl md:text-2xl font-bold text-gray-100">
          {Number(value).toFixed(4)}
        </span>
        <div className="overflow-hidden">
          {additionalFields}
          <HeaderTimeDisplay time={time} timePlaceholder={timePlaceholder} />
        </div>
        {isHovered && detailData && <Legend data={detailData} />}
      </div>
    </View>
  )
}
