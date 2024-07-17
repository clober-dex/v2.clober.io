import React, { useMemo, useState } from 'react'
import { getAddress, isAddressEqual, parseUnits } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'
import { getQuoteToken } from '@clober/v2-sdk'

import { LimitForm } from '../components/form/limit-form'
import OrderBook from '../components/order-book'
import { useChainContext } from '../contexts/chain-context'
import { useMarketContext } from '../contexts/limit/market-context'
import { textStyles } from '../themes/text-styles'
import { useOpenOrderContext } from '../contexts/limit/open-order-context'
import { useLimitContext } from '../contexts/limit/limit-context'
import { ActionButton } from '../components/button/action-button'
import { OpenOrderCard } from '../components/card/open-order-card'
import { useLimitContractContext } from '../contexts/limit/limit-contract-context'
import { useCurrencyContext } from '../contexts/currency-context'
import { isAddressesEqual } from '../utils/address'

import { ChartContainer } from './chart-container'

export const LimitContainer = () => {
  const { selectedChain } = useChainContext()
  const {
    selectedMarket,
    availableDecimalPlacesGroups,
    selectedDecimalPlaces,
    setSelectedDecimalPlaces,
    bids,
    asks,
    setDepthClickedIndex,
  } = useMarketContext()
  const { openOrders } = useOpenOrderContext()
  const { limit, cancels, claims } = useLimitContractContext()
  const { address: userAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const {
    isBid,
    setIsBid,
    showInputCurrencySelect,
    setShowInputCurrencySelect,
    inputCurrency,
    setInputCurrency,
    inputCurrencyAmount,
    setInputCurrencyAmount,
    showOutputCurrencySelect,
    setShowOutputCurrencySelect,
    outputCurrency,
    setOutputCurrency,
    outputCurrencyAmount,
    setOutputCurrencyAmount,
    isPostOnly,
    setIsPostOnly,
    priceInput,
    setPriceInput,
  } = useLimitContext()
  const { balances, prices, currencies, setCurrencies } = useCurrencyContext()
  const [showOrderBook, setShowOrderBook] = useState(true)

  const [quoteCurrency, baseCurrency] = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      const quote = getQuoteToken({
        chainId: selectedChain.id,
        token0: inputCurrency.address,
        token1: outputCurrency.address,
      })
      return isAddressEqual(quote, inputCurrency.address)
        ? [inputCurrency, outputCurrency]
        : [outputCurrency, inputCurrency]
    } else {
      return [undefined, undefined]
    }
  }, [inputCurrency, outputCurrency, selectedChain.id])

  const amount = useMemo(
    () => parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18),
    [inputCurrency?.decimals, inputCurrencyAmount],
  )

  const claimableOpenOrders = openOrders.filter(
    ({ claimable }) =>
      parseUnits(claimable.value, claimable.currency.decimals) > 0n,
  )
  const cancellableOpenOrders = openOrders.filter(
    ({ cancelable }) =>
      parseUnits(cancelable.value, cancelable.currency.decimals) > 0n,
  )

  return (
    <div className="flex flex-col w-fit mb-4 sm:mb-6">
      <button
        className="rounded bg-blue-500 bg-opacity-20 text-blue-500 px-2 py-1 w-fit mb-3 text-xs sm:text-sm"
        onClick={() => setShowOrderBook(!showOrderBook)}
      >
        {showOrderBook ? 'View Chart' : 'View Order Book'}
      </button>
      <div className="flex flex-col w-full lg:flex-row gap-4">
        {!showOrderBook && !selectedMarket ? (
          <div className="flex flex-col bg-gray-900 overflow-hidden rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[704px]" />
        ) : (
          <></>
        )}
        {!showOrderBook && selectedMarket ? (
          <ChartContainer
            selectedMarket={selectedMarket}
            setShowOrderBook={setShowOrderBook}
          />
        ) : (
          <></>
        )}
        {showOrderBook && !quoteCurrency && !baseCurrency ? (
          <div className="flex flex-col p-4 sm:p-6 bg-gray-900 rounded-lg sm:rounded-xl gap-6 w-[360px] sm:w-[480px]" />
        ) : (
          <></>
        )}
        {showOrderBook &&
        quoteCurrency &&
        baseCurrency &&
        selectedDecimalPlaces ? (
          <OrderBook
            name={`${baseCurrency.symbol}/${quoteCurrency.symbol}`}
            bids={bids}
            asks={asks}
            availableDecimalPlacesGroups={availableDecimalPlacesGroups ?? []}
            selectedDecimalPlaces={selectedDecimalPlaces}
            setSelectedDecimalPlaces={setSelectedDecimalPlaces}
            setDepthClickedIndex={setDepthClickedIndex}
            className="flex flex-col p-4 sm:p-6 bg-gray-900 rounded-lg sm:rounded-xl gap-6 w-[360px] sm:w-[480px]"
          />
        ) : (
          <></>
        )}
        <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-[360px] sm:w-[480px] h-[391px] sm:h-[459px] md:h-[459px] lg:h-[460px]">
          <LimitForm
            chainId={selectedChain.id}
            prices={prices}
            balances={balances}
            currencies={currencies}
            setCurrencies={setCurrencies}
            priceInput={priceInput}
            setPriceInput={setPriceInput}
            selectedMarket={selectedMarket}
            isBid={isBid}
            isPostOnly={isPostOnly}
            setIsPostOnly={setIsPostOnly}
            showInputCurrencySelect={showInputCurrencySelect}
            setShowInputCurrencySelect={setShowInputCurrencySelect}
            inputCurrency={inputCurrency}
            setInputCurrency={setInputCurrency}
            inputCurrencyAmount={inputCurrencyAmount}
            setInputCurrencyAmount={setInputCurrencyAmount}
            availableInputCurrencyBalance={
              inputCurrency
                ? balances[getAddress(inputCurrency.address)] ?? 0n
                : 0n
            }
            showOutputCurrencySelect={showOutputCurrencySelect}
            setShowOutputCurrencySelect={setShowOutputCurrencySelect}
            outputCurrency={outputCurrency}
            setOutputCurrency={setOutputCurrency}
            outputCurrencyAmount={outputCurrencyAmount}
            setOutputCurrencyAmount={setOutputCurrencyAmount}
            availableOutputCurrencyBalance={
              outputCurrency
                ? balances[getAddress(outputCurrency.address)] ?? 0n
                : 0n
            }
            swapInputCurrencyAndOutputCurrency={() => {
              setIsBid((prevState) => !prevState)
              setDepthClickedIndex(undefined)
              setInputCurrencyAmount(outputCurrencyAmount)

              // swap currencies
              const _inputCurrency = inputCurrency
              setInputCurrency(outputCurrency)
              setOutputCurrency(_inputCurrency)
            }}
            minimumDecimalPlaces={availableDecimalPlacesGroups?.[0]?.value}
            actionButtonProps={{
              disabled:
                (!walletClient ||
                  !inputCurrency ||
                  !outputCurrency ||
                  (selectedMarket &&
                    !isAddressesEqual(
                      [inputCurrency.address, outputCurrency.address],
                      [
                        selectedMarket.base.address,
                        selectedMarket.quote.address,
                      ],
                    )) ||
                  amount === 0n ||
                  amount > balances[getAddress(inputCurrency.address)]) ??
                0n,
              onClick: async () => {
                if (!inputCurrency || !outputCurrency || !selectedMarket) {
                  return
                }
                await limit(
                  inputCurrency,
                  outputCurrency,
                  inputCurrencyAmount,
                  priceInput,
                  isPostOnly,
                  selectedMarket,
                )
              },
              text: !walletClient
                ? 'Connect wallet'
                : !inputCurrency
                ? 'Select input currency'
                : !outputCurrency
                ? 'Select output currency'
                : amount === 0n
                ? 'Enter amount'
                : amount > balances[getAddress(inputCurrency.address)]
                ? 'Insufficient balance'
                : `Place Order`,
            }}
          />
        </div>
      </div>
      {userAddress ? (
        <div className="flex pb-4 pt-8 px-1 sm:border-solid border-b-gray-800 border-b-[1.5px]">
          <div className="flex gap-6">
            <div
              className={`m-0 p-0 bg-transparent text-white ${textStyles.body2}`}
            >
              Open Orders
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 ml-auto h-6">
            <ActionButton
              className="w-[64px] sm:w-[120px] flex flex-1 items-center justify-center rounded bg-gray-700 hover:bg-blue-600 text-white text-[10px] sm:text-sm disabled:bg-gray-800 disabled:text-gray-500 h-6 sm:h-7"
              disabled={claimableOpenOrders.length === 0}
              onClick={async () => {
                await claims(claimableOpenOrders)
              }}
              text={`Claim (${claimableOpenOrders.length})`}
            />
            <ActionButton
              className="w-[64px] sm:w-[120px] flex flex-1 items-center justify-center rounded bg-gray-700 hover:bg-blue-600 text-white text-[10px] sm:text-sm disabled:bg-gray-800 disabled:text-gray-500 h-6 sm:h-7"
              disabled={cancellableOpenOrders.length === 0}
              onClick={async () => {
                await cancels(cancellableOpenOrders)
              }}
              text={`Cancel (${cancellableOpenOrders.length})`}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex w-full justify-center mt-0 sm:mt-4">
        <div className="flex flex-col w-full lg:w-auto h-full lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {openOrders.map((openOrder, index) => (
            <OpenOrderCard
              chainId={selectedChain.id}
              openOrder={openOrder}
              key={index}
              claimActionButtonProps={{
                disabled:
                  parseUnits(
                    openOrder.claimable.value,
                    openOrder.claimable.currency.decimals,
                  ) === 0n,
                onClick: async () => {
                  await claims([openOrder])
                },
                text: 'Claim',
              }}
              cancelActionButtonProps={{
                disabled: !openOrder.cancelable,
                onClick: async () => {
                  await cancels([openOrder])
                },
                text: 'Cancel',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
