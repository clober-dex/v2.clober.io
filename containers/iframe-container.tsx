import React, { useMemo } from 'react'
import { getAddress, isAddressEqual, parseUnits } from 'viem'
import { useWalletClient } from 'wagmi'
import Link from 'next/link'
import { getQuoteToken } from '@clober/v2-sdk'

import { LimitForm } from '../components/form/limit-form'
import OrderBook from '../components/order-book'
import { useChainContext } from '../contexts/chain-context'
import { useMarketContext } from '../contexts/limit/market-context'
import { useLimitContext } from '../contexts/limit/limit-context'
import { useLimitContractContext } from '../contexts/limit/limit-contract-context'

export const IframeContainer = () => {
  const { selectedChain } = useChainContext()
  const {
    selectedMarket,
    availableDecimalPlacesGroups,
    selectedDecimalPlaces,
    setSelectedDecimalPlaces,
    bids,
    asks,
    depthClickedIndex,
    setDepthClickedIndex,
  } = useMarketContext()
  const { limit } = useLimitContractContext()
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
    balances,
    currencies,
    setCurrencies,
  } = useLimitContext()

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

  return (
    <div className="flex flex-col w-full mb-4 sm:mb-6">
      <Link
        href={`/limit?chain=${selectedChain.id}&inputCurrency=${inputCurrency?.address}&outputCurrency=${outputCurrency?.address}`}
        target="_blank"
        className="ml-auto rounded bg-blue-500 bg-opacity-20 text-blue-500 px-2 py-1 w-fit mb-3 text-sm"
      >
        Open orders
      </Link>
      <div className="flex flex-col w-full lg:flex-row gap-4">
        {quoteCurrency &&
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
            className="flex flex-col p-4 sm:p-6 bg-gray-900 rounded-lg sm:rounded-xl gap-6 w-full"
          />
        ) : (
          <></>
        )}
        <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-full">
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
            actionButtonProps={{
              disabled:
                (!walletClient ||
                  !inputCurrency ||
                  !outputCurrency ||
                  amount === 0n ||
                  amount > balances[getAddress(inputCurrency.address)]) ??
                0n,
              onClick: async () => {
                if (!inputCurrency || !outputCurrency) {
                  return
                }
                await limit(
                  inputCurrency,
                  outputCurrency,
                  inputCurrencyAmount,
                  priceInput,
                  isPostOnly,
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
    </div>
  )
}
