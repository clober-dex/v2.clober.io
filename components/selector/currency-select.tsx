import React from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'

import { Currency } from '../../model/currency'
import { LeftBracketAngleSvg } from '../svg/left-bracket-angle-svg'
import { SearchSvg } from '../svg/search-svg'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import { CurrencyIcon } from '../icon/currency-icon'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'

const CurrencySelect = ({
  chainId,
  currencies,
  setCurrencies,
  balances,
  prices,
  onBack,
  onCurrencySelect,
}: {
  chainId: number
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  balances: Balances
  prices: Prices
  onBack: () => void
  onCurrencySelect: (currency: Currency) => void
} & React.HTMLAttributes<HTMLDivElement>) => {
  console.log('CurrencySelect', setCurrencies)
  const [value, setValue] = React.useState('')
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <div className="w-6 h-6 cursor-pointer relative" onClick={onBack}>
          <LeftBracketAngleSvg />
        </div>
        <div className="flex flex-1 items-center justify-center text-base sm:text-xl font-bold text-white">
          Select a token
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
            className="inline w-full rounded-md border-0 pl-10 py-3 text-gray-900 dark:bg-gray-800 placeholder:text-gray-400 text-xs sm:text-sm"
            placeholder="Search by token name, symbol, or address"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col h-72 overflow-y-auto bg-gray-900 rounded-b-xl sm:rounded-b-3xl">
        {currencies
          .filter(
            (currency) =>
              (isAddress(value) &&
                isAddressEqual(currency.address, getAddress(value))) ||
              currency.name.toLowerCase().includes(value.toLowerCase()) ||
              currency.symbol.toLowerCase().includes(value.toLowerCase()),
          )
          .sort((a, b) => {
            const aValue =
              Number(balances[a.address] ?? 0n) *
              (prices[a.address] ?? 0.000000000000001)
            const bValue =
              Number(balances[b.address] ?? 0n) *
              (prices[b.address] ?? 0.000000000000001)
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          })
          .map((currency) => (
            <button
              key={currency.address}
              className="flex w-full px-4 py-2 items-center justify-between text-start"
              onClick={() => onCurrencySelect(currency)}
            >
              <div className="flex items-center gap-3">
                <CurrencyIcon
                  currency={currency}
                  className="w-6 h-6 sm:w-8 sm:h-8"
                />
                <div>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {currency.symbol}
                  </div>
                  <div className="text-xs text-gray-500">{currency.name}</div>
                </div>
              </div>
              <div className="flex-1 text-sm text-end text-white">
                <div>
                  {formatUnits(
                    balances[currency.address] ?? 0n,
                    currency.decimals,
                    prices[currency.address] ?? 0,
                  )}
                </div>
                {prices[currency.address] ? (
                  <div className="text-gray-500 text-xs">
                    {formatDollarValue(
                      balances[currency.address] ?? 0n,
                      currency.decimals,
                      prices[currency.address] ?? 0,
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

export default CurrencySelect
