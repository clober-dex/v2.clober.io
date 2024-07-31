import React, { useCallback, useMemo } from 'react'
import { parseUnits } from 'viem'

import { Currency } from '../../model/currency'
import { TriangleDownSvg } from '../svg/triangle-down-svg'
import { CurrencyIcon } from '../icon/currency-icon'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import { toPlacesString } from '../../utils/bignumber'

import NumberInput from './number-input'

const LpCurrencyAmountInput = ({
  currency,
  currency0,
  currency1,
  value,
  onValueChange,
  availableAmount,
  price,
  onCurrencyClick,
  ...props
}: {
  currency: Currency
  currency0: Currency
  currency1: Currency
  value: string
  onValueChange: (value: string) => void
  availableAmount: bigint
  price?: number
  onCurrencyClick?: () => void
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  const decimals = useMemo(() => currency?.decimals ?? 18, [currency])

  const onBlur = useCallback(() => {
    const amount = parseUnits(value, decimals)
    onValueChange(amount ? formatUnits(amount, decimals) : '')
  }, [decimals, onValueChange, value])

  const onMaxClick = useCallback(() => {
    onValueChange(
      availableAmount
        ? formatUnits(availableAmount, currency?.decimals ?? 18)
        : '',
    )
  }, [availableAmount, currency?.decimals, onValueChange])

  return (
    <div className="h-[74px] sm:h-[84px] group hover:ring-1 hover:ring-gray-700 flex flex-col bg-gray-800 rounded-lg p-3 gap-2">
      <div className="flex flex-1 justify-between gap-2">
        <NumberInput
          className="flex-1 text-xl w-full sm:text-2xl bg-transparent placeholder-gray-500 text-white outline-none"
          value={value}
          onValueChange={onValueChange}
          onBlur={onBlur}
          placeholder="0.0000"
          {...props}
        />
        {onCurrencyClick ? (
          currency ? (
            <button
              className="flex w-fit items-center rounded-full bg-gray-700 py-1 pl-2 pr-3 gap-2"
              onClick={onCurrencyClick}
            >
              <div className="w-8 h-5 shrink-0 relative">
                <CurrencyIcon
                  currency={currency0}
                  className="w-5 h-5 absolute left-0 top-0 z-[1]"
                />
                <CurrencyIcon
                  currency={currency1}
                  className="w-5 h-5 absolute left-4 top-0"
                />
              </div>
              <div className="text-sm sm:text-base text-white">
                {currency.symbol}
              </div>
            </button>
          ) : (
            <button
              className="flex items-center rounded-full bg-blue-500 text-white pl-3 pr-2 py-1 gap-2 text-sm sm:text-base"
              onClick={onCurrencyClick}
            >
              Select token <TriangleDownSvg />
            </button>
          )
        ) : currency ? (
          <div className="flex w-fit items-center rounded-full bg-gray-700 py-1 pl-2 pr-3 gap-2">
            <div className="w-8 h-5 shrink-0 relative">
              <CurrencyIcon
                currency={currency0}
                className="w-5 h-5 absolute left-0 top-0 z-[1]"
              />
              <CurrencyIcon
                currency={currency1}
                className="w-5 h-5 absolute left-4 top-0"
              />
            </div>
            <div className="text-sm sm:text-base text-white">
              {currency.symbol}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex items-end justify-between">
        {price ? (
          <div className="text-gray-500 text-xs sm:text-sm">
            ~{formatDollarValue(parseUnits(value, decimals), decimals, price)}
          </div>
        ) : (
          <div></div>
        )}
        <div className="h-4">
          {!props.disabled && currency ? (
            <div className="flex text-xs sm:text-sm gap-1 sm:gap-2">
              <div className="text-gray-500">Available</div>
              <div className="text-white">
                {toPlacesString(
                  formatUnits(availableAmount, currency.decimals, price),
                )}
              </div>
              <button className="text-blue-500" onClick={onMaxClick}>
                MAX
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  )
}

export default LpCurrencyAmountInput
