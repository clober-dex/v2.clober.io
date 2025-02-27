import React, { useEffect, useState } from 'react'
import { getAddress, parseUnits, zeroAddress } from 'viem'
import { useAccount, useFeeData, useQuery } from 'wagmi'

import { SwapForm } from '../components/form/swap-form'
import { useChainContext } from '../contexts/chain-context'
import { formatUnits } from '../utils/bigint'
import { fetchQuotes } from '../apis/swap/quotes'
import { AGGREGATORS } from '../constants/aggregators'
import { useSwapContext } from '../contexts/swap/swap-context'
import { useSwapContractContext } from '../contexts/swap/swap-contract-context'
import { useCurrencyContext } from '../contexts/currency-context'

export const SwapContainer = () => {
  const {
    inputCurrency,
    setInputCurrency,
    inputCurrencyAmount,
    setInputCurrencyAmount,
    outputCurrency,
    setOutputCurrency,
    slippageInput,
    setSlippageInput,
  } = useSwapContext()
  const { balances, currencies, setCurrencies, prices } = useCurrencyContext()
  const { swap } = useSwapContractContext()
  const { data: feeData } = useFeeData()
  const { address: userAddress } = useAccount()
  const { selectedChain } = useChainContext()

  const [debouncedValue, setDebouncedValue] = useState('')
  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [latestRefreshTime, setLatestRefreshTime] = useState(Date.now())

  const amountIn = parseUnits(
    inputCurrencyAmount,
    inputCurrency?.decimals ?? 18,
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputCurrencyAmount)
    }, 500)

    return () => clearTimeout(timer)
  }, [inputCurrencyAmount])

  const { data } = useQuery(
    [
      'quotes',
      inputCurrency,
      outputCurrency,
      Number(inputCurrencyAmount),
      slippageInput,
      userAddress,
      selectedChain,
      latestRefreshTime,
      debouncedValue,
    ],
    async () => {
      if (
        feeData &&
        feeData.gasPrice &&
        inputCurrency &&
        outputCurrency &&
        amountIn > 0n &&
        Number(debouncedValue) === Number(inputCurrencyAmount)
      ) {
        return fetchQuotes(
          AGGREGATORS[selectedChain.id],
          inputCurrency,
          amountIn,
          outputCurrency,
          parseFloat(slippageInput),
          feeData.gasPrice,
          userAddress,
        )
      }
      return null
    },
    { enabled: !!debouncedValue },
  )

  useEffect(() => {
    setShowInputCurrencySelect(false)
  }, [selectedChain])

  return (
    <div className="flex flex-col w-fit mb-4 sm:mb-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col w-full lg:flex-row gap-4">
          <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-full sm:w-[434px] md:w-[528px] lg:w-[480px] sm:h-[392px]">
            <SwapForm
              chainId={selectedChain.id}
              currencies={currencies}
              setCurrencies={setCurrencies}
              balances={balances}
              prices={prices}
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
              outputCurrencyAmount={formatUnits(
                data?.amountOut ?? 0n,
                outputCurrency?.decimals ?? 18,
              )}
              slippageInput={slippageInput}
              setSlippageInput={setSlippageInput}
              gasEstimateValue={
                parseFloat(
                  formatUnits(
                    BigInt(data?.gasLimit ?? 0n) *
                      BigInt(feeData?.gasPrice ?? 0n),
                    selectedChain.nativeCurrency.decimals,
                  ),
                ) * (prices[getAddress(zeroAddress)] ?? 0)
              }
              refresh={() => setLatestRefreshTime(Date.now())}
              aggregatorName={data?.aggregator?.name ?? ''}
              actionButtonProps={{
                disabled:
                  !userAddress ||
                  !inputCurrency ||
                  !outputCurrency ||
                  !inputCurrencyAmount ||
                  !feeData ||
                  !feeData.gasPrice ||
                  !data ||
                  amountIn !== data.amountIn,
                onClick: async () => {
                  if (
                    !userAddress ||
                    !inputCurrency ||
                    !outputCurrency ||
                    !inputCurrencyAmount ||
                    !feeData ||
                    !feeData.gasPrice ||
                    !data ||
                    amountIn !== data.amountIn
                  ) {
                    return
                  }
                  await swap(
                    inputCurrency,
                    amountIn,
                    outputCurrency,
                    data.amountOut,
                    parseFloat(slippageInput),
                    feeData.gasPrice,
                    userAddress,
                    AGGREGATORS[selectedChain.id].find(
                      (aggregator) => aggregator.name === data.aggregator.name,
                    )!,
                  )
                },
                text: 'Swap',
              }}
            />
          </div>
          {/*{data?.pathViz ? (*/}
          {/*  <div className="relative flex flex-col rounded-2xl bg-gray-900 p-6">*/}
          {/*    <PathVizViewer pathVizData={data.pathViz} />*/}
          {/*  </div>*/}
          {/*) : (*/}
          {/*  <div className="hidden min-h-[270px] h-full w-full md:w-[528px] xl:w-[648px] lg:flex flex-col rounded-2xl bg-gray-900 p-6" />*/}
          {/*)}*/}
        </div>
      </div>
    </div>
  )
}
