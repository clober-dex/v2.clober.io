import React, { useCallback } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import Image from 'next/image'

import { Currency } from '../../model/currency'
import { LeftBracketAngleSvg } from '../svg/left-bracket-angle-svg'
import { SearchSvg } from '../svg/search-svg'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import { CurrencyIcon } from '../icon/currency-icon'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'
import {
  deduplicateCurrencies,
  fetchCurrenciesByName,
  fetchCurrency,
} from '../../utils/currency'
import { shortAddress } from '../../utils/address'
import InspectCurrencyModal from '../modal/inspect-currency-modal'

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
  const [customizedCurrencies, setCustomizedCurrencies] = React.useState<
    Currency[] | undefined
  >()
  const [loadingCurrencies, setLoadingCurrencies] =
    React.useState<boolean>(false)
  const [inspectingCurrency, setInspectingCurrency] = React.useState<
    Currency | undefined
  >(undefined)
  const [value, _setValue] = React.useState('')
  const setValue = useCallback(
    async (value: string) => {
      _setValue(value)
      setLoadingCurrencies(true)
      if (
        isAddress(value) &&
        !currencies.find((currency) =>
          isAddressEqual(currency.address, getAddress(value)),
        )
      ) {
        if (
          defaultBlacklistedCurrency &&
          isAddressEqual(defaultBlacklistedCurrency.address, getAddress(value))
        ) {
          setCustomizedCurrencies(undefined)
        } else {
          const currency = await fetchCurrency(chainId, value)
          if (currency) {
            setCustomizedCurrencies([currency])
          } else {
            setCustomizedCurrencies(undefined)
          }
        }
      } else if (!isAddress(value)) {
        const currencies = await fetchCurrenciesByName(chainId, value)
        if (currencies.length > 0) {
          setCustomizedCurrencies(currencies)
        } else {
          setCustomizedCurrencies(undefined)
        }
      }
      setLoadingCurrencies(false)
    },
    [chainId, currencies, defaultBlacklistedCurrency],
  )

  return (
    <>
      <InspectCurrencyModal
        currency={inspectingCurrency}
        onCurrencySelect={onCurrencySelect}
        setInspectingCurrency={setInspectingCurrency}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div
            className="w-6 h-6 cursor-pointer flex items-center justify-center shrink-0"
            onClick={onBack}
          >
            <LeftBracketAngleSvg />
          </div>
          <div className="flex flex-1 items-center justify-center text-base sm:text-xl font-bold text-white flex-grow">
            Select a token
          </div>
          <div className="w-6 h-6 shrink-0"></div>
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
              className="inline w-full rounded-md border-0 pl-10 py-3 text-gray-500 bg-gray-800 placeholder:text-gray-500 text-xs sm:text-sm"
              placeholder="Search by token name, symbol, or address"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col h-60 overflow-y-auto custom-scrollbar bg-gray-900 rounded-b-xl sm:rounded-b-3xl">
          {deduplicateCurrencies(
            customizedCurrencies
              ? [...currencies, ...customizedCurrencies]
              : currencies,
          )
            .filter(
              (currency) =>
                (isAddress(value) &&
                  isAddressEqual(currency.address, getAddress(value))) ||
                currency.name.toLowerCase().includes(value.toLowerCase()) ||
                currency.symbol.toLowerCase().includes(value.toLowerCase()),
            )
            .filter(
              (currency) =>
                !defaultBlacklistedCurrency ||
                !isAddressEqual(
                  currency.address,
                  defaultBlacklistedCurrency.address,
                ),
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
                className="flex w-full px-4 py-2 items-center justify-between text-start hover:bg-gray-700 rounded-lg shrink-0"
                onClick={() => {
                  if (currency.isVerified) {
                    onCurrencySelect(currency)
                  } else {
                    setInspectingCurrency(currency)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <CurrencyIcon
                    currency={currency}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div className="flex-col justify-center items-start gap-[2px]">
                    <div className="flex items-center gap-1">
                      <div className="text-sm sm:text-base font-bold text-white">
                        {currency.symbol}
                      </div>
                      {!currency.isVerified ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M8.9073 4.41123C9.38356 3.55396 10.6164 3.55396 11.0927 4.41122L16.6937 14.493C17.1565 15.3261 16.5541 16.35 15.601 16.35H4.39903C3.44592 16.35 2.84346 15.3261 3.30633 14.493L8.9073 4.41123Z"
                            stroke="#FACC15"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M10 9V10.8"
                            stroke="#FACC15"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="9.99961"
                            cy="13.5"
                            r="0.9"
                            fill="#FACC15"
                          />
                        </svg>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">
                        {currency.name}
                      </div>
                      {!currency.isVerified ? (
                        <button
                          className="flex px-1 py-[2px] justify-center items-center gap-1 rounded bg-[#2B3544] active:ring-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(currency.address)
                          }}
                        >
                          <div className="text-white text-xs margin">
                            {shortAddress(currency.address)}
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.006 8.3685C1.85267 8.28109 1.72514 8.15475 1.63629 8.00225C1.54744 7.84975 1.50043 7.67649 1.5 7.5V3.25C1.5 2 2.25 1.5 3.25 1.5L7.5 1.5C7.875 1.5 8.079 1.6925 8.25 2M3.5 4.8335C3.5 4.47983 3.64049 4.14065 3.89057 3.89057C4.14065 3.64049 4.47983 3.5 4.8335 3.5H9.1665C9.34162 3.5 9.51502 3.53449 9.67681 3.60151C9.8386 3.66852 9.9856 3.76675 10.1094 3.89057C10.2333 4.0144 10.3315 4.1614 10.3985 4.32319C10.4655 4.48498 10.5 4.65838 10.5 4.8335V9.1665C10.5 9.34162 10.4655 9.51502 10.3985 9.67681C10.3315 9.8386 10.2333 9.9856 10.1094 10.1094C9.9856 10.2333 9.8386 10.3315 9.67681 10.3985C9.51502 10.4655 9.34162 10.5 9.1665 10.5H4.8335C4.65838 10.5 4.48498 10.4655 4.32319 10.3985C4.1614 10.3315 4.0144 10.2333 3.89057 10.1094C3.76675 9.9856 3.66852 9.8386 3.60151 9.67681C3.53449 9.51502 3.5 9.34162 3.5 9.1665V4.8335Z"
                              stroke="#9CA3AF"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      ) : (
                        <></>
                      )}
                    </div>
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
          {loadingCurrencies ? (
            <div className="flex items-center justify-center h-16">
              <Image src="/loading.gif" alt="loading" width={50} height={50} />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  )
}

export default CurrencySelect
