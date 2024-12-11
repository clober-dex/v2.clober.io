import React from 'react'
import { getAddress, isAddressEqual } from 'viem'
import { getMarketPrice, getPriceNeighborhood, Market } from '@clober/v2-sdk'
import BigNumber from 'bignumber.js'

import NumberInput from '../input/number-input'
import CurrencyAmountInput from '../input/currency-amount-input'
import { Currency } from '../../model/currency'
import { ArrowDownSvg } from '../svg/arrow-down-svg'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import CurrencySelect from '../selector/currency-select'
import { Balances } from '../../model/balances'
import { Prices } from '../../model/prices'
import CheckIcon from '../icon/check-icon'
import { toPlacesString } from '../../utils/bignumber'
import { getPriceDecimals } from '../../utils/prices'
import { testnetChainIds } from '../../constants/chain'

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
  minimumDecimalPlaces,
  marketRateDiff,
  setMarketRateAction,
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
  minimumDecimalPlaces: number | undefined
  marketRateDiff: number
  setMarketRateAction: {
    isLoading: boolean
    action: () => Promise<void>
  }
  actionButtonProps: ActionButtonProps
}) => {
  minimumDecimalPlaces = minimumDecimalPlaces
    ? minimumDecimalPlaces
    : getPriceDecimals(Number(priceInput))
  const minimumPrice = toPlacesString(
    new BigNumber(0.1).pow(minimumDecimalPlaces).toString(),
    minimumDecimalPlaces,
    BigNumber.ROUND_CEIL,
  )
  const maximumPrice = toPlacesString(
    '8662020672688495886265',
    minimumDecimalPlaces,
    BigNumber.ROUND_FLOOR,
  )
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
      defaultBlacklistedCurrency={outputCurrency}
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
      defaultBlacklistedCurrency={inputCurrency}
    />
  ) : (
    <>
      <div className="hover:ring-1 hover:ring-gray-700 flex rounded-lg border-solid border-[1.5px] border-gray-700 p-4 mb-3 sm:mb-4">
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex flex-row gap-1">
            <div className="text-gray-500 text-xs sm:text-sm">
              {isBid ? 'Buy' : 'Sell'}{' '}
              {isBid ? outputCurrency?.symbol : inputCurrency?.symbol} at rate
            </div>
            {marketRateDiff >= 10000 ? (
              <div className="text-xs sm:text-sm font-semibold text-green-400">
                (&gt;10000%)
              </div>
            ) : !isNaN(marketRateDiff) ? (
              <div
                className={`text-gray-200 ${
                  marketRateDiff >= 0 ? 'text-green-400' : 'text-red-400'
                } sm:text-sm font-semibold`}
              >
                ({marketRateDiff.toFixed(2)}%)
              </div>
            ) : (
              <></>
            )}
            {!testnetChainIds.includes(chainId) ? (
              <button
                disabled={setMarketRateAction.isLoading}
                onClick={async () => {
                  await setMarketRateAction.action()
                }}
                className="flex ml-auto mr-[10px] sm:mr-[16px] text-center text-blue-500 text-xs sm:text-sm font-semibold disabled:opacity-50"
              >
                Use Market
              </button>
            ) : (
              <></>
            )}
          </div>
          {setMarketRateAction.isLoading ? (
            <span className="w-[235px] sm:w-[340px] h-7 sm:h-8 rounded animate-pulse bg-gray-500" />
          ) : (
            <NumberInput
              value={priceInput}
              onValueChange={setPriceInput}
              className="text-xl w-full sm:text-2xl bg-transparent placeholder-gray-500 text-white outline-none"
            />
          )}
        </div>
        <div className="flex w-[34px] sm:w-11 h-12 sm:h-[60px] flex-col gap-[6px] md:gap-2">
          <button
            onClick={() => {
              if (
                selectedMarket &&
                inputCurrency &&
                outputCurrency &&
                !new BigNumber(priceInput).isNaN()
              ) {
                if (new BigNumber(priceInput).gte(maximumPrice)) {
                  setPriceInput('')
                  return
                }
                const {
                  normal: {
                    now: { tick },
                  },
                } = getPriceNeighborhood({
                  chainId,
                  price: priceInput,
                  currency0: inputCurrency,
                  currency1: outputCurrency,
                })
                let currentTick = tick
                // eslint-disable-next-line no-constant-condition
                while (true) {
                  const price = getMarketPrice({
                    marketQuoteCurrency: selectedMarket.quote,
                    marketBaseCurrency: selectedMarket.base,
                    bidTick: currentTick,
                  })
                  const nextPrice = toPlacesString(
                    price,
                    minimumDecimalPlaces,
                    BigNumber.ROUND_CEIL,
                  )
                  if (new BigNumber(nextPrice).lt(minimumPrice)) {
                    setPriceInput(minimumPrice)
                    break
                  }
                  if (new BigNumber(nextPrice).gt(priceInput)) {
                    setPriceInput(nextPrice)
                    break
                  }
                  currentTick = currentTick + 1n
                }
              }
            }}
            className="cursor-pointer group group-hover:ring-1 group-hover:ring-gray-700 flex w-full h-[21px] sm:h-[26px] bg-gray-800 rounded flex-col items-center justify-center gap-1"
          >
            <svg
              className="group-hover:stroke-white stroke-[#9CA3AF] w-[12px] h-[7px] sm:w-[14px] sm:h-[8px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 12 7"
              fill="none"
            >
              <path
                d="M11 6L6 1L1 6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (
                selectedMarket &&
                inputCurrency &&
                outputCurrency &&
                !new BigNumber(priceInput).isNaN()
              ) {
                if (new BigNumber(priceInput).gte(maximumPrice)) {
                  setPriceInput('')
                  return
                }
                const {
                  normal: {
                    now: { tick },
                  },
                } = getPriceNeighborhood({
                  chainId,
                  price: priceInput,
                  currency0: inputCurrency,
                  currency1: outputCurrency,
                })
                let currentTick = tick
                // eslint-disable-next-line no-constant-condition
                while (true) {
                  const price = getMarketPrice({
                    marketQuoteCurrency: selectedMarket.quote,
                    marketBaseCurrency: selectedMarket.base,
                    bidTick: currentTick,
                  })
                  const nextPrice = toPlacesString(
                    price,
                    minimumDecimalPlaces,
                    BigNumber.ROUND_CEIL,
                  )
                  if (new BigNumber(nextPrice).lte(minimumPrice)) {
                    setPriceInput(minimumPrice)
                    break
                  }
                  if (new BigNumber(nextPrice).lt(priceInput)) {
                    setPriceInput(nextPrice)
                    break
                  }
                  currentTick = currentTick - 1n
                }
              }
            }}
            className="cursor-pointer group group-hover:ring-1 group-hover:ring-gray-700 flex w-full h-[21px] sm:h-[26px] bg-gray-800 rounded flex-col items-center justify-center gap-1"
          >
            <svg
              className="group-hover:stroke-white stroke-[#9CA3AF] w-[12px] h-[7px] sm:w-[14px] sm:h-[8px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 12 7"
              fill="none"
            >
              <path
                d="M1 1L6 6L11 1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
              ? prices[getAddress(inputCurrency.address)] ?? 0
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
              ? prices[getAddress(outputCurrency.address)] ?? 0
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
