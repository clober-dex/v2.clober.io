import React, { useCallback } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'

import { Currency } from '../../model/currency'
import { LeftBracketAngleSvg } from '../svg/left-bracket-angle-svg'
import { SearchSvg } from '../svg/search-svg'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import { CurrencyIcon } from '../icon/currency-icon'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'
import { fetchCurrency } from '../../utils/currency'

const CurrencySelect = ({
  chainId,
  currencies,
  balances,
  prices,
  onBack,
  onCurrencySelect,
  defaultBlacklistedCurrency,
}: {
  chainId: number
  currencies: Currency[]
  balances: Balances
  prices: Prices
  onBack: () => void
  onCurrencySelect: (currency: Currency) => void
  defaultBlacklistedCurrency?: Currency
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [customizedCurrency, setCustomizedCurrency] = React.useState<
    Currency | undefined
  >()
  const [value, _setValue] = React.useState('')
  const setValue = useCallback(
    async (value: string) => {
      if (
        isAddress(value) &&
        !currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(value)),
        ) &&
        defaultBlacklistedCurrency &&
        !isAddressEqual(defaultBlacklistedCurrency.address, getAddress(value))
      ) {
        const currency = await fetchCurrency(chainId, value)
        if (currency) {
          setCustomizedCurrency(currency)
        } else {
          setCustomizedCurrency(undefined)
        }
      }
      _setValue(value)
    },
    [chainId, currencies, defaultBlacklistedCurrency],
  )

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
        {(customizedCurrency ? [...currencies, customizedCurrency] : currencies)
          .filter(
            (currency) =>
              (isAddress(value) &&
                isAddressEqual(currency.address, getAddress(value))) ||
              currency.name.toLowerCase().includes(value.toLowerCase()) ||
              currency.symbol.toLowerCase().includes(value.toLowerCase()),
          )
          .sort((a, b) => {
            const aValue =
              Number(balances[getAddress(a.address)] ?? 0n) *
              (prices[getAddress(a.address)] ?? 0.000000000000001)
            const bValue =
              Number(balances[getAddress(b.address)] ?? 0n) *
              (prices[getAddress(b.address)] ?? 0.000000000000001)
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
                    balances[getAddress(currency.address)] ?? 0n,
                    currency.decimals,
                    prices[getAddress(currency.address)] ?? 0,
                  )}
                </div>
                {prices[getAddress(currency.address)] ? (
                  <div className="text-gray-500 text-xs">
                    {formatDollarValue(
                      balances[getAddress(currency.address)] ?? 0n,
                      currency.decimals,
                      prices[getAddress(currency.address)] ?? 0,
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
