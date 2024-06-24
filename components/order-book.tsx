import React from 'react'
import BigNumber from 'bignumber.js'

import { Decimals } from '../model/decimals'
import { toPlacesString } from '../utils/bignumber'

import DecimalsSelector from './selector/decimals-selector'

export default function OrderBook({
  name,
  bids,
  asks,
  availableDecimalPlacesGroups,
  selectedDecimalPlaces,
  setSelectedDecimalPlaces,
  setDepthClickedIndex,
  ...props
}: {
  name: string
  bids: { price: string; size: string; tick: number }[]
  asks: { price: string; size: string; tick: number }[]
  availableDecimalPlacesGroups: Decimals[]
  selectedDecimalPlaces: Decimals
  setSelectedDecimalPlaces: (decimals: Decimals) => void
  setDepthClickedIndex: (index: {
    isBid: boolean
    index: number
    depth: { price: string; size: string; tick: number }
  }) => void
} & React.HTMLAttributes<HTMLDivElement>) {
  const biggestDepth = BigNumber.max(
    BigNumber.max(...asks.map(({ size }) => size), 0),
    BigNumber.max(...bids.map(({ size }) => size), 0),
  )

  return (
    <div {...props}>
      <div className="flex items-center justify-between">
        <div className="text-sm sm:text-base text-white font-bold">{name}</div>
        <div className="flex items-center gap-2">
          <DecimalsSelector
            availableDecimalPlacesGroups={availableDecimalPlacesGroups}
            value={selectedDecimalPlaces}
            onValueChange={setSelectedDecimalPlaces}
          />
        </div>
      </div>

      <div className="flex text-xs">
        <div className="flex flex-1 flex-col basis-0 overflow-auto">
          <div className="flex justify-between text-gray-500 gap-4 sm:gap-12 px-2 mb-1 sm:mb-3">
            <div>Amount</div>
            <div>Price</div>
          </div>
          {bids
            .sort((a, b) => new BigNumber(b.price).minus(a.price).toNumber())
            .slice(0, 20)
            .map(({ price, size, tick }, index) => {
              return (
                <button
                  key={`bid-${index}`}
                  className="px-2 flex items-center justify-between shrink-0 relative tabular-nums"
                  onClick={() =>
                    setDepthClickedIndex({
                      isBid: true,
                      index,
                      depth: { price, size, tick },
                    })
                  }
                >
                  <div className="text-gray-200">{toPlacesString(size)}</div>
                  <div className="text-green-500">{price}</div>
                  <div
                    className="absolute h-full right-0 bg-[#45D87F26]"
                    style={{
                      width: `${new BigNumber(size)
                        .div(biggestDepth)
                        .multipliedBy(100)
                        .toNumber()}%`,
                    }}
                  />
                </button>
              )
            })}
        </div>
        <div className="flex flex-1 flex-col basis-0 overflow-auto">
          <div className="flex justify-between text-gray-500 gap-4 sm:gap-12 px-2 mb-1 sm:mb-3">
            <div>Price</div>
            <div>Amount</div>
          </div>
          {asks
            .sort((a, b) => new BigNumber(a.price).minus(b.price).toNumber())
            .slice(0, 20)
            .map(({ price, size, tick }, index) => {
              return (
                <button
                  key={`ask-${index}`}
                  className="px-2 flex items-center justify-between shrink-0 relative tabular-nums"
                  onClick={() =>
                    setDepthClickedIndex({
                      isBid: false,
                      index,
                      depth: { price, size, tick },
                    })
                  }
                >
                  <div className="text-red-500">{price}</div>
                  <div className="text-gray-200">{toPlacesString(size)}</div>
                  <div
                    className="absolute h-full left-0 bg-[#F94E5C26]"
                    style={{
                      width: `${new BigNumber(size)
                        .div(biggestDepth)
                        .multipliedBy(100)
                        .toNumber()}%`,
                    }}
                  />
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
