import React, { useState } from 'react'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { Market } from '@clober/v2-sdk'

import { useChainContext } from '../contexts/chain-context'

const TVChartContainer = dynamic(
  () => import('./tv-chart-container').then((mod) => mod.TvChartContainer),
  { ssr: false },
)

export const ChartContainer = ({
  selectedMarket,
  setShowOrderBook,
}: {
  selectedMarket: Market
  setShowOrderBook: (showOrderBook: boolean) => void
}) => {
  const { selectedChain } = useChainContext()
  const [isScriptReady, setIsScriptReady] = useState(false)

  return (
    <>
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true)
        }}
      />
      {isScriptReady ? (
        <TVChartContainer
          chainId={selectedChain.id}
          market={selectedMarket}
          setShowOrderBook={setShowOrderBook}
        />
      ) : (
        <></>
      )}
    </>
  )
}
