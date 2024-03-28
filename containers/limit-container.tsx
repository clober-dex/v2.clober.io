import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isAddressEqual, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'
import { useWalletClient } from 'wagmi'

import { LimitForm } from '../components/form/limit-form'
import OrderBook from '../components/order-book'
import { useChainContext } from '../contexts/chain-context'
import { useMarketContext } from '../contexts/limit/market-context'
import { formatUnits } from '../utils/bigint'
import { parsePrice } from '../utils/prices'
import { textStyles } from '../themes/text-styles'
import { toPlacesString } from '../utils/bignumber'
import { useOpenOrderContext } from '../contexts/limit/open-order-context'
import { useLimitContext } from '../contexts/limit/limit-context'
import {
  calculateOutputCurrencyAmountString,
  calculatePriceInputString,
} from '../utils/order-book'
import { ActionButton } from '../components/button/action-button'
import { OpenOrderCard } from '../components/card/open-order-card'
import { useLimitContractContext } from '../contexts/limit/limit-contract-context'
import { getMarketId } from '../utils/market'

import { ChartContainer } from './chart-container'

export const LimitContainer = () => {
  const { selectedChain } = useChainContext()
  const { selectedMarket } = useMarketContext()
  const { openOrders } = useOpenOrderContext()
  const { limit, make, cancels, claims } = useLimitContractContext()
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
    setClaimBounty,
    isPostOnly,
    setIsPostOnly,
    selectedDecimalPlaces,
    setSelectedDecimalPlaces,
    priceInput,
    setPriceInput,
    availableDecimalPlacesGroups,
    bids,
    asks,
    balances,
    currencies,
    setCurrencies,
  } = useLimitContext()
  const [showOrderBook, setShowOrderBook] = useState(true)

  const [depthClickedIndex, setDepthClickedIndex] = useState<
    | {
        isBid: boolean
        index: number
      }
    | undefined
  >(undefined)

  // once
  useEffect(() => {
    setSelectedDecimalPlaces(availableDecimalPlacesGroups[0])
  }, [
    availableDecimalPlacesGroups,
    setInputCurrencyAmount,
    setSelectedDecimalPlaces,
  ])

  // When chain is changed
  useEffect(() => {
    setClaimBounty(
      formatUnits(
        selectedChain.defaultGasPrice,
        selectedChain.nativeCurrency.decimals,
      ),
    )
  }, [
    selectedChain.defaultGasPrice,
    selectedChain.nativeCurrency.decimals,
    setClaimBounty,
  ])

  // When depth is changed
  useEffect(() => {
    setDepthClickedIndex(undefined)

    setPriceInput(
      isBid
        ? toPlacesString(asks[0]?.price ?? bids[0]?.price ?? '1')
        : toPlacesString(bids[0]?.price ?? asks[0]?.price ?? '1'),
    )
  }, [asks, bids, isBid, setPriceInput])

  // When depthClickedIndex is changed, reset the priceInput
  useEffect(() => {
    if (depthClickedIndex) {
      setPriceInput(
        depthClickedIndex.isBid
          ? bids[depthClickedIndex.index]?.price
          : asks[depthClickedIndex.index]?.price,
      )
    }
  }, [asks, bids, depthClickedIndex, setPriceInput])

  const previousValues = useRef({
    priceInput,
    outputCurrencyAmount,
    inputCurrencyAmount,
  })

  useEffect(() => {
    if (
      new BigNumber(inputCurrencyAmount).isNaN() ||
      new BigNumber(inputCurrencyAmount).isZero() ||
      !outputCurrency?.decimals
    ) {
      return
    }

    // `priceInput` is changed -> `outputCurrencyAmount` will be changed
    if (previousValues.current.priceInput !== priceInput) {
      const outputCurrencyAmount = calculateOutputCurrencyAmountString(
        isBid,
        inputCurrencyAmount,
        priceInput,
        outputCurrency.decimals,
      )
      setOutputCurrencyAmount(outputCurrencyAmount)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
    // `outputCurrencyAmount` is changed -> `priceInput` will be changed
    else if (
      previousValues.current.outputCurrencyAmount !== outputCurrencyAmount
    ) {
      const priceInput = calculatePriceInputString(
        isBid,
        inputCurrencyAmount,
        outputCurrencyAmount,
        previousValues.current.priceInput,
      )
      setPriceInput(priceInput)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
    // `inputCurrencyAmount` is changed -> `outputCurrencyAmount` will be changed
    else if (
      previousValues.current.inputCurrencyAmount !== inputCurrencyAmount
    ) {
      const outputCurrencyAmount = calculateOutputCurrencyAmountString(
        isBid,
        inputCurrencyAmount,
        priceInput,
        outputCurrency.decimals,
      )
      setOutputCurrencyAmount(outputCurrencyAmount)
      previousValues.current = {
        priceInput,
        outputCurrencyAmount,
        inputCurrencyAmount,
      }
    }
  }, [
    priceInput,
    inputCurrencyAmount,
    outputCurrencyAmount,
    isBid,
    outputCurrency?.decimals,
    setOutputCurrencyAmount,
    setPriceInput,
  ])

  const [quoteCurrency, baseCurrency] = useMemo(() => {
    if (inputCurrency && outputCurrency) {
      const { quote } = getMarketId(selectedChain.id, [
        inputCurrency.address,
        outputCurrency.address,
      ])
      return isAddressEqual(quote, inputCurrency.address)
        ? [inputCurrency, outputCurrency]
        : [outputCurrency, inputCurrency]
    } else {
      return [undefined, undefined]
    }
  }, [inputCurrency, outputCurrency, selectedChain.id])

  const [amount, price] = useMemo(
    () => [
      parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18),
      parsePrice(
        Number(priceInput),
        selectedMarket?.quote.decimals ?? 18,
        selectedMarket?.base.decimals ?? 18,
      ),
    ],
    [
      inputCurrency?.decimals,
      inputCurrencyAmount,
      priceInput,
      selectedMarket?.base.decimals,
      selectedMarket?.quote.decimals,
    ],
  )

  const claimableOpenOrders = openOrders.filter(
    (openOrder) => openOrder.claimableAmount > 0n,
  )
  const cancellableOpenOrders = openOrders.filter(
    (openOrder) => openOrder.cancelable,
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
          <ChartContainer selectedMarket={selectedMarket} />
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
        availableDecimalPlacesGroups &&
        selectedDecimalPlaces ? (
          <OrderBook
            name={`${baseCurrency.symbol}/${quoteCurrency.symbol}`}
            bids={bids}
            asks={asks}
            availableDecimalPlacesGroups={availableDecimalPlacesGroups}
            selectedDecimalPlaces={selectedDecimalPlaces}
            setSelectedDecimalPlaces={setSelectedDecimalPlaces}
            setDepthClickedIndex={setDepthClickedIndex}
          />
        ) : (
          <></>
        )}
        <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-[360px] sm:w-[480px] lg:h-[460px]">
          <LimitForm
            chainId={selectedChain.id}
            prices={{}} // todo
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
              inputCurrency ? balances[inputCurrency.address] ?? 0n : 0n
            }
            showOutputCurrencySelect={showOutputCurrencySelect}
            setShowOutputCurrencySelect={setShowOutputCurrencySelect}
            outputCurrency={outputCurrency}
            setOutputCurrency={setOutputCurrency}
            outputCurrencyAmount={outputCurrencyAmount}
            setOutputCurrencyAmount={setOutputCurrencyAmount}
            availableOutputCurrencyBalance={
              outputCurrency ? balances[outputCurrency.address] ?? 0n : 0n
            }
            swapInputCurrencyAndOutputCurrency={() => {
              setIsBid((prevState) =>
                depthClickedIndex ? depthClickedIndex.isBid : !prevState,
              )
              setDepthClickedIndex(undefined)
              setInputCurrencyAmount(outputCurrencyAmount)

              // swap currencies
              const _inputCurrency = inputCurrency
              setInputCurrency(outputCurrency)
              setOutputCurrency(_inputCurrency)
            }}
            actionButtonProps={{
              disabled:
                (!walletClient ||
                  !inputCurrency ||
                  !outputCurrency ||
                  amount === 0n ||
                  amount > balances[inputCurrency.address]) ??
                0n,
              onClick: async () => {
                if (!inputCurrency || !outputCurrency) {
                  return
                }
                if (isPostOnly) {
                  await make(inputCurrency, outputCurrency, amount, price)
                  return
                }
                if (selectedMarket) {
                  await limit(
                    selectedMarket,
                    inputCurrency,
                    outputCurrency,
                    amount,
                    price,
                  )
                } else {
                  await make(inputCurrency, outputCurrency, amount, price)
                }
              },
              text: !walletClient
                ? 'Connect wallet'
                : !inputCurrency
                  ? 'Select input currency'
                  : !outputCurrency
                    ? 'Select output currency'
                    : amount === 0n
                      ? 'Enter amount'
                      : amount > balances[inputCurrency.address]
                        ? 'Insufficient balance'
                        : `Limit ${isBid ? 'Bid' : 'Ask'}`,
            }}
          />
        </div>
      </div>
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
      <div className="flex w-full justify-center mt-0 sm:mt-4">
        <div className="flex flex-col w-full lg:w-auto h-full lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {openOrders.map((openOrder, index) => (
            <OpenOrderCard
              openOrder={openOrder}
              key={index}
              claimActionButtonProps={{
                disabled: openOrder.claimableAmount === 0n,
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
