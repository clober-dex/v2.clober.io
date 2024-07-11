import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CHAIN_IDS, Market } from '@clober/v2-sdk'
import { Tooltip } from 'react-tooltip'

import {
  CustomTimezones,
  LanguageCode,
  ResolutionString,
  widget,
} from '../public/static/charting_library'
import DataFeed from '../utils/datafeed'
import { SUPPORTED_INTERVALS } from '../utils/chart'
import { QuestionMarkSvg } from '../components/svg/question-mark-svg'
import CloseSvg from '../components/svg/close-svg'
import { getWindowSize } from '../utils/screen'

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null
    ? null
    : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode)
}

export const TvChartContainer = ({
  chainId,
  market,
  setShowOrderBook,
}: {
  chainId: CHAIN_IDS
  market: Market
  setShowOrderBook: (showOrderBook: boolean) => void
}) => {
  const [windowSize, setWindowSize] = useState(getWindowSize())
  const isMobile = useMemo(() => windowSize.width <= 1024, [windowSize])
  const [interval, setInterval] = useState('60' as ResolutionString)
  const [_fullscreen, setFullscreen] = useState(false)
  const fullscreen = useMemo(
    () => _fullscreen || isMobile,
    [_fullscreen, isMobile],
  )

  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  const symbol = useMemo(
    () => `${market.base.symbol}/${market.quote.symbol}`,
    [market],
  )

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize(getWindowSize())
    }
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    const tvWidget = new widget({
      symbol,
      datafeed: new DataFeed(chainId, market.base, market.quote),
      interval,
      container: chartContainerRef.current,
      library_path: '/static/charting_library/',
      locale: getLanguageFromURL() || 'en',
      disabled_features: [
        'header_widget',
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_compare',
        'timeframes_toolbar',
        'create_volume_indicator_by_default',
      ],
      enabled_features: ['study_templates', 'hide_left_toolbar_by_default'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      theme: 'Dark',
      timezone: Intl.DateTimeFormat().resolvedOptions()
        .timeZone as CustomTimezones,
      autosize: true,
      toolbar_bg: '#111827',
      loading_screen: {
        backgroundColor: '#111827',
        foregroundColor: '#111827',
      },
      overrides: {
        'mainSeriesProperties.priceAxisProperties.log': true,
      },
    })

    tvWidget.onChartReady(() => {
      tvWidget.applyOverrides({
        'paneProperties.backgroundGradientStartColor': '#111827',
        'paneProperties.backgroundGradientEndColor': '#111827',
      })
      tvWidget.activeChart().createStudy('Volume', false, false)
    })

    return () => {
      tvWidget.remove()
    }
  }, [symbol, interval, chainId, market.base, market.quote])

  return (
    <>
      {fullscreen && (
        <div className="flex flex-col rounded-2xl bg-gray-900 overflow-hidden min-h-[280px] w-full md:w-[480px] lg:w-[704px]" />
      )}
      <div
        className={`flex flex-col bg-gray-900 overflow-hidden ${
          fullscreen
            ? 'w-full fixed left-0 top-0 right-0 bottom-0 z-10'
            : 'rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[704px]'
        }`}
      >
        <div className="left-0 top-0 right-20 z-20 flex items-center justify-end gap-2 px-4 py-2">
          <div className="flex mr-auto">
            <QuestionMarkSvg
              data-tooltip-id="trading-view-info"
              data-tooltip-place="bottom-end"
              data-tooltip-html={
                'CLOBBER&lsquo;s charting solution is powered by TradingView, a charting platform for the global community. In addition to a wide range of charts, advanced analytical tools such as the <a href="https://tradingview.com/economic-calendar/" target="_blank" class="text-blue-500 underline">Economic Calendar</a> or <a href="https://tradingview.com/screener/" target="_blank" class="text-blue-500 underline">Stock Screener</a> allow you to make trades based on comprehensive market analysis.'
                // 'Powered by <a href="https://www.tradingview.com/" target="_blank" class="text-blue-500 underline">TradingView</a>'
              }
              className="w-3 h-3"
            />
            <Tooltip
              id="trading-view-info"
              style={{
                width: '300px',
              }}
              clickable
            />
          </div>
          {SUPPORTED_INTERVALS.map(([key, label]) => (
            <button
              key={key}
              className={`px-2 py-1 rounded-2xl text-xs md:text-sm ${
                key === interval
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-500 hover:bg-gray-800 hover:text-gray-200'
              }`}
              onClick={() => setInterval(key as ResolutionString)}
            >
              {label.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => setShowOrderBook(true)}
            className="flex lg:hidden p-0 pl-2 bg-transparent"
          >
            <CloseSvg className="w-3 h-3" />
          </button>
          <button
            className={`max-lg:hidden p-0 pl-2 bg-transparent`}
            onClick={() => setFullscreen((x) => !x)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="block w-4 h-4 stroke-gray-500 hover:stroke-gray-200"
            >
              <path
                d="M11 2H14V5"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
              <path
                d="M10 6L13 3"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M5 14H2V11"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
              <path
                d="M6 10L3 13"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div
          className="flex flex-col flex-1 [&>iframe]:flex-1"
          ref={chartContainerRef}
        />
      </div>
    </>
  )
}
