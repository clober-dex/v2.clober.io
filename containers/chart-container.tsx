import React, { useState } from 'react'
import Script from 'next/script'
import dynamic from 'next/dynamic'

import { useChainContext } from '../contexts/chain-context'
import { MarketV1 } from '../model/market-v1'

const TVChartContainer = dynamic(
  () => import('./tv-chart-container').then((mod) => mod.TvChartContainer),
  { ssr: false },
)

export const ChartContainer = ({
  selectedMarket,
}: {
  selectedMarket: MarketV1
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
        <TVChartContainer chainId={selectedChain.id} market={selectedMarket} />
      ) : (
        <></>
      )}
    </>
  )
}
