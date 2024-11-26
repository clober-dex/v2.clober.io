import React from 'react'
import BigNumber from 'bignumber.js'

import { Pool } from '../../model/pool'
import { Prices } from '../../model/prices'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { Currency } from '../../model/currency'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import LpCurrencyAmountInput from '../input/lp-currency-amount-input'
import { SettingSvg } from '../svg/setting-svg'
import { SwapSettingModal } from '../modal/swap-setting-modal'
import useDropdown from '../../hooks/useDropdown'

export const RemoveLiquidityForm = ({
  pool,
  prices,
  lpCurrencyAmount,
  setLpCurrencyAmount,
  availableLpCurrencyBalance,
  receiveCurrencies,
  slippageInput,
  setSlippageInput,
  isCalculatingReceiveCurrencies,
  actionButtonProps,
}: {
  pool: Pool
  prices: Prices
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  availableLpCurrencyBalance: bigint
  receiveCurrencies: { currency: Currency; amount: bigint }[]
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  isCalculatingReceiveCurrencies: boolean
  actionButtonProps: ActionButtonProps
}) => {
  const { showDropdown, setShowDropdown } = useDropdown()

  return (
    <>
      <div className="flex flex-col relative gap-4 self-stretch">
        <div className="text-white text-sm md:text-base font-bold">
          Enter amount you’d like to withdraw.
        </div>
        <LpCurrencyAmountInput
          currency={pool.lpCurrency}
          currency0={pool.currency0}
          currency1={pool.currency1}
          value={lpCurrencyAmount}
          onValueChange={setLpCurrencyAmount}
          availableAmount={availableLpCurrencyBalance}
          price={prices[pool.lpCurrency.address] ?? 0}
        />
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch">
        <div className="flex justify-start h-[72px] md:h-[76px] items-center gap-2 self-stretch">
          <div className="flex h-full text-gray-400 text-sm font-semibold">
            You will receive
          </div>
          <div className="flex h-full flex-col ml-auto gap-2">
            {receiveCurrencies.map((receiveCurrency, index) => (
              <div
                key={index}
                className="flex ml-auto items-center gap-1 ml-2 text-white text-sm md:text-base font-semibold"
              >
                {isCalculatingReceiveCurrencies ? (
                  <span className="w-[100px] h-6 mx-1 rounded animate-pulse bg-gray-500"></span>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 text-white text-sm md:text-base font-bold">
                      <div>
                        {formatUnits(
                          receiveCurrency.amount,
                          receiveCurrency.currency.decimals,
                          prices[receiveCurrency.currency.address] ?? 0,
                        )}
                      </div>
                      <div>{receiveCurrency.currency.symbol}</div>
                    </div>
                    <div className="text-gray-400 text-sm md:text-base font-semibold">
                      (
                      {formatDollarValue(
                        receiveCurrency.amount,
                        receiveCurrency.currency.decimals,
                        prices[receiveCurrency.currency.address] ?? 0,
                      )}
                      )
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 self-stretch">
          <div className="text-gray-400 text-sm font-semibold">
            Max Slippage
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setShowDropdown(true)}
              className="flex relative items-center gap-1 text-blue-500 bg-blue-500 hover:bg-opacity-30 bg-opacity-20 rounded px-2 text-xs sm:text-sm h-6 sm:h-7 whitespace-nowrap"
            >
              <SettingSvg className="sm:w-4 sm:h-4 w-3 h-3" />
              {`${new BigNumber(slippageInput).toFixed(2)}%`}
              {showDropdown ? (
                <SwapSettingModal
                  slippageInput={slippageInput}
                  setSlippageInput={setSlippageInput}
                  position="right"
                />
              ) : (
                <></>
              )}
            </button>
          </div>
        </div>
      </div>
      <ActionButton {...actionButtonProps} />
    </>
  )
}
