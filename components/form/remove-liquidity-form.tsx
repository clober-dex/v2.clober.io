import React from 'react'

import { Pool } from '../../model/pool'
import { Prices } from '../../model/prices'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { Currency } from '../../model/currency'
import CurrencyAmountInput from '../input/currency-amount-input'
import { CurrencyIcon } from '../icon/currency-icon'
import { formatDollarValue, formatUnits } from '../../utils/bigint'

export const RemoveLiquidityForm = ({
  pool,
  prices,
  lpCurrencyAmount,
  setLpCurrencyAmount,
  availableLpCurrencyBalance,
  removeLiquidityType,
  setRemoveLiquidityType,
  receiveCurrencies,
  actionButtonProps,
}: {
  pool: Pool
  prices: Prices
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  availableLpCurrencyBalance: bigint
  removeLiquidityType: 'mixed' | 'currency0' | 'currency1'
  setRemoveLiquidityType: (
    removeLiquidityType: 'mixed' | 'currency0' | 'currency1',
  ) => void
  receiveCurrencies: { currency: Currency; amount: bigint }[]
  actionButtonProps: ActionButtonProps
}) => {
  return (
    <>
      <div className="flex flex-col relative gap-4 self-stretch">
        <div className="text-white text-sm md:text-base font-bold">
          Enter amount you’d like to withdraw.
        </div>
        <CurrencyAmountInput
          currency={pool.lpCurrency}
          value={lpCurrencyAmount}
          onValueChange={setLpCurrencyAmount}
          availableAmount={availableLpCurrencyBalance}
          price={prices[pool.lpCurrency.address]}
        />
      </div>
      <div className="flex flex-col items-start gap-4 self-stretch">
        <div className="text-white text-sm md:text-base font-bold">
          Select the asset you’d like to receive with.
        </div>
        <div className="flex w-full h-14 px-2 rounded-xl border border-solid border-slate-800 justify-center items-center">
          <button
            disabled={removeLiquidityType === 'mixed'}
            onClick={() => setRemoveLiquidityType('mixed')}
            className="flex flex-1 px-6 py-4 disabled:bg-slate-800 rounded-xl justify-center items-center gap-2"
          >
            <CurrencyIcon
              currency={pool.lpCurrency}
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <div className="whitespace-nowrap opacity-90 text-center text-gray-400 text-sm font-semibold">
              {pool.currency0.symbol} + {pool.currency1.symbol}
            </div>
          </button>
          <button
            disabled={removeLiquidityType === 'currency0'}
            onClick={() => setRemoveLiquidityType('currency0')}
            className="flex flex-1 px-6 py-4 disabled:bg-slate-800 rounded-xl justify-center items-center gap-2"
          >
            <CurrencyIcon
              currency={pool.currency0}
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <div className="whitespace-nowrap opacity-90 text-center text-gray-400 text-sm font-semibold">
              {pool.currency0.symbol}
            </div>
          </button>
          <button
            disabled={removeLiquidityType === 'currency1'}
            onClick={() => setRemoveLiquidityType('currency1')}
            className="flex flex-1 px-6 py-4 disabled:bg-slate-800 rounded-xl justify-center items-center gap-2"
          >
            <CurrencyIcon
              currency={pool.currency1}
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <div className="whitespace-nowrap opacity-90 text-center text-gray-400 text-sm font-semibold">
              {pool.currency1.symbol}
            </div>
          </button>
        </div>
      </div>
      <div className="flex justify-start h-[72px] md:h-[76px] items-center gap-2 self-stretch">
        <div className="flex h-full text-gray-400 text-sm font-semibold">
          You will receive
        </div>
        <div className="flex h-full flex-col ml-auto gap-2">
          {receiveCurrencies.map((receiveCurrency, index) => (
            <div
              key={index}
              className="flex items-center gap-1 ml-2 text-white text-sm md:text-base font-semibold"
            >
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-white text-sm md:text-base font-bold">
                  <div>
                    {formatUnits(
                      receiveCurrency.amount,
                      receiveCurrency.currency.decimals,
                      prices[receiveCurrency.currency.address],
                    )}
                  </div>
                  <div>{receiveCurrency.currency.symbol}</div>
                </div>
                <div className="text-gray-400 text-sm md:text-base font-semibold">
                  (
                  {formatDollarValue(
                    receiveCurrency.amount,
                    receiveCurrency.currency.decimals,
                    prices[receiveCurrency.currency.address],
                  )}
                  )
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ActionButton {...actionButtonProps} />
    </>
  )
}
