import React from 'react'
import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'
import BigNumber from 'bignumber.js'

import { Pool } from '../../model/pool'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import CurrencyAmountInput from '../input/currency-amount-input'
import { toPlacesString } from '../../utils/bignumber'
import { formatDollarValue, formatUnits } from '../../utils/bigint'
import { SettingSvg } from '../svg/setting-svg'
import { SwapSettingModal } from '../modal/swap-setting-modal'
import useDropdown from '../../hooks/useDropdown'
export const AddLiquidityForm = ({
  pool,
  balances,
  prices,
  currency0Amount,
  setCurrency0Amount,
  availableCurrency0Balance,
  currency1Amount,
  setCurrency1Amount,
  availableCurrency1Balance,
  asRatio,
  setAsRatio,
  slippageInput,
  setSlippageInput,
  actionButtonProps,
}: {
  pool: Pool
  balances: Balances
  prices: Prices
  currency0Amount: string
  setCurrency0Amount: (inputCurrencyAmount: string) => void
  availableCurrency0Balance: bigint
  currency1Amount: string
  setCurrency1Amount: (inputCurrencyAmount: string) => void
  availableCurrency1Balance: bigint
  asRatio: boolean
  setAsRatio: (asRatio: boolean) => void
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  actionButtonProps: ActionButtonProps
}) => {
  const { showDropdown, setShowDropdown } = useDropdown()

  return (
    <>
      <div className="flex flex-col relative gap-4 self-stretch">
        <div className="w-full text-white text-base font-bold">
          Enter amount you’d like to add.
        </div>
        <div className="flex flex-col relative gap-4 self-stretch">
          <CurrencyAmountInput
            currency={pool.currency0}
            value={currency0Amount}
            onValueChange={setCurrency0Amount}
            availableAmount={availableCurrency0Balance}
            price={prices[pool.currency0.address]}
          />
          <CurrencyAmountInput
            currency={pool.currency1}
            value={currency1Amount}
            onValueChange={setCurrency1Amount}
            availableAmount={availableCurrency1Balance}
            price={prices[pool.currency1.address]}
          />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-white text-sm font-semibold ">Add by ratio</div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onClick={() => {
                setAsRatio(!asRatio)
              }}
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch">
        <div className="flex items-center gap-2 self-stretch">
          <div className="text-gray-400 text-sm font-semibold">
            You will receive
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <div className="flex items-center gap-1 text-white text-base font-bold">
              <div>
                {toPlacesString(
                  formatUnits(
                    balances[pool.lpCurrency.address] ?? 0n,
                    pool.lpCurrency.decimals,
                    prices[pool.lpCurrency.address],
                  ),
                )}
              </div>
              <div className="text-gray-400 text-base font-semibold">
                (
                {formatDollarValue(
                  balances[pool.lpCurrency.address] ?? 0n,
                  pool.lpCurrency.decimals,
                  prices[pool.lpCurrency.address],
                )}
                )
              </div>
            </div>
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
