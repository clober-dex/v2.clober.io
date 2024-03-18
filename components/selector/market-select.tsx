import React from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'

import { LeftBracketAngleSvg } from '../svg/left-bracket-angle-svg'
import { SearchSvg } from '../svg/search-svg'
import { MarketV1 } from '../../model/market-v1'
import { CurrencyIcon } from '../icon/currency-icon'
import { formatUnits } from '../../utils/bigint'
import { PRICE_DECIMAL } from '../../utils/prices'
import { toPlacesString } from '../../utils/bignumber'

const MarketSelect = ({
  markets,
  onBack,
  onMarketSelect,
}: {
  markets: MarketV1[]
  onBack: () => void
  onMarketSelect: (market: MarketV1) => void
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [value, setValue] = React.useState('')
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 cursor-pointer relative" onClick={onBack}>
          <LeftBracketAngleSvg />
        </div>
        <div className="flex flex-1 items-center justify-center text-base sm:text-xl font-bold text-white">
          Select a market
        </div>
      </div>
      <div className="flex flex-col relative rounded shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <div className="relative h-4 w-4">
            <SearchSvg />
          </div>
        </div>
        <div className="inline-block">
          <div className="invisible h-0 mx-[29px]" aria-hidden="true">
            Search by token name, symbol, or address
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-xs sm:text-sm placeholder-gray-500 text-white outline-none focus:ring-white focus:ring-[1.5px]"
            placeholder="Search by token name, symbol, or address"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col h-72 overflow-y-auto bg-gray-900 rounded-b-xl sm:rounded-b-3xl">
        {markets
          .filter(
            (market) =>
              (isAddress(value) &&
                isAddressEqual(market.baseToken.address, getAddress(value))) ||
              (isAddress(value) &&
                isAddressEqual(market.quoteToken.address, getAddress(value))) ||
              (isAddress(value) &&
                isAddressEqual(market.address, getAddress(value))) ||
              market.baseToken.name
                .toLowerCase()
                .includes(value.toLowerCase()) ||
              market.quoteToken.name
                .toLowerCase()
                .includes(value.toLowerCase()),
          )
          .map((market) => (
            <button
              key={market.address}
              className="flex w-full px-4 py-2 items-center justify-between text-start"
              onClick={() => onMarketSelect(market)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-[52px] h-6 sm:h-8">
                  <CurrencyIcon
                    currency={market.quoteToken}
                    className="absolute w-8 h-8 right-0"
                  />
                  <CurrencyIcon
                    currency={market.baseToken}
                    className="absolute w-8 h-8 left-0"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-white">
                    {market.baseToken.symbol}-{market.quoteToken.symbol}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {market.baseToken.name}
                  </div>
                </div>
              </div>
              <div className="flex-1 text-sm text-end text-white">
                <div>
                  {toPlacesString(
                    formatUnits(market.latestPrice ?? 0n, PRICE_DECIMAL),
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

export default MarketSelect
