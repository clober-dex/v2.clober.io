import React from 'react'

import { Pool } from '../../model/pool'
import { Prices } from '../../model/prices'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { Currency } from '../../model/currency'
import CurrencyAmountInput from '../input/currency-amount-input'
import { formatDollarValue, formatUnits } from '../../utils/bigint'

export const RemoveLiquidityForm = ({
  pool,
  prices,
  lpCurrencyAmount,
  setLpCurrencyAmount,
  availableLpCurrencyBalance,
  receiveCurrencies,
  actionButtonProps,
}: {
  pool: Pool
  prices: Prices
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  availableLpCurrencyBalance: bigint
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
