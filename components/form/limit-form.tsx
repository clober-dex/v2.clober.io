import React, { useState } from 'react'

import NumberInput from '../input/number-input'
import CurrencyAmountInput from '../input/currency-amount-input'
import { Currency } from '../../model/currency'
import { ArrowDownSvg } from '../svg/arrow-down-svg'
import { SettingSvg } from '../svg/setting-svg'
import MarketSelect from '../selector/market-select'
import { Market } from '../../model/market'
import { ActionButton, ActionButtonProps } from '../button/action-button'

export const LimitForm = ({
  priceInput,
  setPriceInput,
  markets,
  selectedMarket,
  setSelectedMarket,
  isBid,
  setSelectMode,
  inputCurrency,
  setInputCurrency,
  inputCurrencyAmount,
  setInputCurrencyAmount,
  availableInputCurrencyBalance,
  outputCurrency,
  setOutputCurrency,
  outputCurrencyAmount,
  setOutputCurrencyAmount,
  availableOutputCurrencyBalance,
  swapInputCurrencyAndOutputCurrency,
  actionButtonProps,
}: {
  priceInput: string
  setPriceInput: (priceInput: string) => void
  markets: Market[]
  selectedMarket?: Market
  setSelectedMarket: (market: Market) => void
  isBid: boolean
  setSelectMode: (selectMode: 'none' | 'settings' | 'selectMarket') => void
  inputCurrency: Currency | undefined
  setInputCurrency: (inputCurrency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (inputCurrencyAmount: string) => void
  availableInputCurrencyBalance: bigint
  outputCurrency: Currency | undefined
  setOutputCurrency: (outputCurrency: Currency | undefined) => void
  outputCurrencyAmount: string
  setOutputCurrencyAmount: (outputCurrencyAmount: string) => void
  availableOutputCurrencyBalance: bigint
  swapInputCurrencyAndOutputCurrency: () => void
  actionButtonProps: ActionButtonProps
}) => {
  const [showMarketSelect, setShowMarketSelect] = useState(false)

  return showMarketSelect ? (
    <MarketSelect
      markets={markets}
      onBack={() => setShowMarketSelect(false)}
      onMarketSelect={(market: Market) => {
        setInputCurrency(market.quoteToken)
        setOutputCurrency(market.baseToken)
        setShowMarketSelect(false)
        setSelectedMarket(market)
      }}
    />
  ) : (
    <>
      <div className="flex rounded-lg border-solid border-[1.5px] border-gray-700 p-4 mb-3 sm:mb-4 bg-gray-800">
        <div className="flex flex-col flex-1 gap-2">
          <div className="text-gray-500 text-xs sm:text-sm">
            {isBid ? 'Buy' : 'Sell'} {selectedMarket?.baseToken.symbol} at rate
          </div>
          <NumberInput
            value={priceInput}
            onValueChange={setPriceInput}
            className="text-xl w-full sm:text-2xl bg-transparent placeholder-gray-500 text-white outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col relative gap-2 sm:gap-4 mb-3 sm:mb-4">
        <CurrencyAmountInput
          currency={inputCurrency}
          value={inputCurrencyAmount}
          onValueChange={setInputCurrencyAmount}
          availableAmount={availableInputCurrencyBalance}
          onCurrencyClick={() => setShowMarketSelect(true)}
        />
        <CurrencyAmountInput
          currency={outputCurrency}
          value={outputCurrencyAmount}
          onValueChange={setOutputCurrencyAmount}
          availableAmount={availableOutputCurrencyBalance}
          onCurrencyClick={() => setShowMarketSelect(true)}
        />
        <div className="absolute flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-900 p-1 sm:p-1.5">
          <button
            className="flex items-center justify-center p-0 bg-gray-700 w-full h-full rounded-full transform hover:rotate-180 transition duration-300"
            onClick={swapInputCurrencyAndOutputCurrency}
          >
            <ArrowDownSvg className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
      <div className="flex justify-end mb-3 sm:mb-4">
        <button
          className="flex items-center gap-1 text-blue-500 bg-blue-500 hover:bg-opacity-30 bg-opacity-20 rounded px-2 text-xs sm:text-sm h-6 sm:h-7"
          onClick={() => setSelectMode('settings')}
        >
          <SettingSvg className="w-3 h-3 sm:w-4 sm:h-4" />
          Setting
        </button>
      </div>
      <ActionButton {...actionButtonProps} />
    </>
  )
}
