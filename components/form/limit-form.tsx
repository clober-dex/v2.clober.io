import React from 'react'
import { getAddress, isAddressEqual } from 'viem'
import { Market } from '@clober/v2-sdk'

import NumberInput from '../input/number-input'
import CurrencyAmountInput from '../input/currency-amount-input'
import { Currency } from '../../model/currency'
import { ArrowDownSvg } from '../svg/arrow-down-svg'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import CurrencySelect from '../selector/currency-select'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'
import CheckIcon from '../icon/check-icon'

export const LimitForm = ({
  chainId,
  currencies,
  setCurrencies,
  balances,
  prices,
  priceInput,
  setPriceInput,
  selectedMarket,
  isBid,
  isPostOnly,
  setIsPostOnly,
  showInputCurrencySelect,
  setShowInputCurrencySelect,
  inputCurrency,
  setInputCurrency,
  inputCurrencyAmount,
  setInputCurrencyAmount,
  availableInputCurrencyBalance,
  showOutputCurrencySelect,
  setShowOutputCurrencySelect,
  outputCurrency,
  setOutputCurrency,
  outputCurrencyAmount,
  setOutputCurrencyAmount,
  availableOutputCurrencyBalance,
  swapInputCurrencyAndOutputCurrency,
  actionButtonProps,
}: {
  chainId: number
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  balances: Balances
  prices: Prices
  priceInput: string
  setPriceInput: (priceInput: string) => void
  selectedMarket?: Market
  isBid: boolean
  isPostOnly: boolean
  setIsPostOnly: (isPostOnly: (prevState: boolean) => boolean) => void
  showInputCurrencySelect: boolean
  setShowInputCurrencySelect: (showInputCurrencySelect: boolean) => void
  inputCurrency: Currency | undefined
  setInputCurrency: (inputCurrency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (inputCurrencyAmount: string) => void
  availableInputCurrencyBalance: bigint
  showOutputCurrencySelect: boolean
  setShowOutputCurrencySelect: (showOutputCurrencySelect: boolean) => void
  outputCurrency: Currency | undefined
  setOutputCurrency: (outputCurrency: Currency | undefined) => void
  outputCurrencyAmount: string
  setOutputCurrencyAmount: (outputCurrencyAmount: string) => void
  availableOutputCurrencyBalance: bigint
  swapInputCurrencyAndOutputCurrency: () => void
  actionButtonProps: ActionButtonProps
}) => {
  return showInputCurrencySelect ? (
    <CurrencySelect
      chainId={chainId}
      currencies={
        outputCurrency
          ? currencies.filter(
              (currency) =>
                !isAddressEqual(currency.address, outputCurrency.address),
            )
          : currencies
      }
      balances={balances}
      prices={prices}
      onBack={() => setShowInputCurrencySelect(false)}
      onCurrencySelect={(currency) => {
        setCurrencies(
          !currencies.find((c) => isAddressEqual(c.address, currency.address))
            ? [...currencies, currency]
            : currencies,
        )
        setInputCurrency(currency)
        setShowInputCurrencySelect(false)
      }}
    />
  ) : showOutputCurrencySelect ? (
    <CurrencySelect
      chainId={chainId}
      currencies={
        inputCurrency
          ? currencies.filter(
              (currency) =>
                !isAddressEqual(currency.address, inputCurrency.address),
            )
          : currencies
      }
      balances={balances}
      prices={prices}
      onBack={() => setShowOutputCurrencySelect(false)}
      onCurrencySelect={(currency) => {
        setCurrencies(
          !currencies.find((c) => isAddressEqual(c.address, currency.address))
            ? [...currencies, currency]
            : currencies,
        )
        setOutputCurrency(currency)
        setShowOutputCurrencySelect(false)
      }}
    />
  ) : (
    <>
      <div className="flex rounded-lg border-solid border-[1.5px] border-gray-700 p-4 mb-3 sm:mb-4 bg-gray-800">
        <div className="flex flex-col flex-1 gap-2">
          <div className="text-gray-500 text-xs sm:text-sm">
            {isBid ? 'Buy' : 'Sell'} {selectedMarket?.base.symbol} at rate
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
          onCurrencyClick={() => setShowInputCurrencySelect(true)}
          price={
            inputCurrency
              ? prices[getAddress(inputCurrency.address)]
              : undefined
          }
        />
        <CurrencyAmountInput
          currency={outputCurrency}
          value={outputCurrencyAmount}
          onValueChange={setOutputCurrencyAmount}
          availableAmount={availableOutputCurrencyBalance}
          onCurrencyClick={() => setShowOutputCurrencySelect(true)}
          price={
            outputCurrency
              ? prices[getAddress(outputCurrency.address)]
              : undefined
          }
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
        <CheckIcon
          checked={isPostOnly}
          onCheck={() => setIsPostOnly((prevState) => !prevState)}
          text="Post Only"
        />
      </div>
      <ActionButton {...actionButtonProps} />
    </>
  )
}
