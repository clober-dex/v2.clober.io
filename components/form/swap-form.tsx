import React, { useMemo } from 'react'
import { isAddressEqual, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'

import CurrencyAmountInput from '../input/currency-amount-input'
import { Currency } from '../../model/currency'
import CurrencySelect from '../selector/currency-select'
import { toPlacesString } from '../../utils/bignumber'
import { GasSvg } from '../svg/gas-svg'
import { SettingSvg } from '../svg/setting-svg'
import useDropdown from '../../hooks/useDropdown'
import { SwapSettingModal } from '../modal/swap-setting-modal'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { Prices } from '../../model/prices'
import { Balances } from '../../model/balances'
import { ArrowDownSvg } from '../svg/arrow-down-svg'

export const SwapForm = ({
  chainId,
  currencies,
  setCurrencies,
  balances,
  prices,
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
  slippageInput,
  setSlippageInput,
  gasEstimateValue,
  actionButtonProps,
}: {
  chainId: number
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  balances: Balances
  prices: Prices
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
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  gasEstimateValue: number
  actionButtonProps: ActionButtonProps
}) => {
  const { showDropdown, setShowDropdown } = useDropdown()

  const exchangeRate =
    !new BigNumber(inputCurrencyAmount).isNaN() &&
    !new BigNumber(outputCurrencyAmount).isNaN()
      ? new BigNumber(outputCurrencyAmount).dividedBy(
          new BigNumber(inputCurrencyAmount),
        )
      : new BigNumber(0)
  const isLoadingResults = useMemo(() => {
    return !!(
      inputCurrency &&
      outputCurrency &&
      parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18) > 0n &&
      parseUnits(outputCurrencyAmount, outputCurrency?.decimals ?? 18) === 0n
    )
  }, [inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount])

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
      <div className="flex flex-col relative gap-2 sm:gap-4 mb-3 sm:mb-4">
        <CurrencyAmountInput
          currency={inputCurrency}
          value={inputCurrencyAmount}
          onValueChange={setInputCurrencyAmount}
          availableAmount={availableInputCurrencyBalance}
          onCurrencyClick={() => setShowInputCurrencySelect(true)}
          price={inputCurrency ? prices[inputCurrency.address] : undefined}
        />
        <CurrencyAmountInput
          currency={outputCurrency}
          value={outputCurrencyAmount}
          onValueChange={() => {}}
          availableAmount={0n}
          onCurrencyClick={() => setShowOutputCurrencySelect(true)}
          price={outputCurrency ? prices[outputCurrency.address] : undefined}
          disabled={true}
        />
        <div className="absolute flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-900 p-1 sm:p-1.5">
          <button
            className="flex items-center justify-center p-0 bg-gray-700 w-full h-full rounded-full transform hover:rotate-180 transition duration-300"
            onClick={() => {
              const prevInputCurrency = inputCurrency
              setInputCurrency(outputCurrency)
              setOutputCurrency(prevInputCurrency)
              setInputCurrencyAmount('')
            }}
          >
            <ArrowDownSvg className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex text-xs sm:text-sm text-white">
          1 {inputCurrency?.symbol ?? 'IN'} ={' '}
          {isLoadingResults ? (
            <span className="w-[100px] mx-1 rounded animate-pulse bg-gray-500" />
          ) : (
            <>
              {exchangeRate ? toPlacesString(exchangeRate) : '? '}
              {outputCurrency?.symbol ?? 'OUT'}
              <span className="text-gray-500">
                (~$
                {toPlacesString(
                  exchangeRate && outputCurrency
                    ? exchangeRate.multipliedBy(
                        prices[outputCurrency.address] ?? 0,
                      )
                    : 0,
                )}
                )
              </span>
            </>
          )}
        </div>
        <div className="flex relative items-center text-xs sm:text-sm text-white">
          <div className="flex items-center h-full mr-0.5">
            <GasSvg />
          </div>
          {isLoadingResults ? (
            <span className="w-[50px] h-[20px] mx-1 rounded animate-pulse bg-gray-500" />
          ) : (
            <div className="flex text-xs sm:text-sm text-white">
              {toPlacesString(gasEstimateValue)}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 mb-4 h-7 gap-2">
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
      <ActionButton {...actionButtonProps} />
    </>
  )
}
