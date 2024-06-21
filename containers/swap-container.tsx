import React, { useEffect, useState } from 'react'
import { getAddress, parseUnits, zeroAddress } from 'viem'
import { useAccount, useFeeData, useQuery } from 'wagmi'

import { SwapForm } from '../components/form/swap-form'
import { useChainContext } from '../contexts/chain-context'
import { formatUnits } from '../utils/bigint'
import PathVizViewer from '../components/path-viz-viewer'
import { fetchQuotes } from '../apis/swap/quotes'
import { AGGREGATORS } from '../constants/aggregators'
import { useSwapContext } from '../contexts/swap/swap-context'
import { useSwapContractContext } from '../contexts/swap/swap-contract-context'

export const SwapContainer = () => {
  const {
    balances,
    currencies,
    setCurrencies,
    prices,
    inputCurrency,
    setInputCurrency,
    inputCurrencyAmount,
    setInputCurrencyAmount,
    outputCurrency,
    setOutputCurrency,
    slippageInput,
    setSlippageInput,
  } = useSwapContext()
  const { swap } = useSwapContractContext()
  const { data: feeData } = useFeeData()
  const { address: userAddress } = useAccount()
  const { selectedChain } = useChainContext()

  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)

  const { data } = useQuery(
    [
      'quotes',
      inputCurrency,
      outputCurrency,
      inputCurrencyAmount,
      slippageInput,
      userAddress,
      selectedChain,
    ],
    async () => {
      if (
        feeData &&
        feeData.gasPrice &&
        inputCurrency &&
        outputCurrency &&
        parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18) > 0n
      ) {
        return fetchQuotes(
          AGGREGATORS[selectedChain.id],
          inputCurrency,
          parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18),
          outputCurrency,
          parseFloat(slippageInput),
          feeData.gasPrice,
          userAddress,
        )
      }
      return null
    },
  )

  useEffect(() => {
    setShowInputCurrencySelect(false)
  }, [selectedChain])

  return (
    <div className="flex flex-col w-fit mb-4 sm:mb-6">
      <div className="flex flex-col w-full lg:flex-row gap-4">
        <div className="flex flex-col rounded-2xl bg-gray-900 p-6 sm:w-[528px] lg:w-[480px]">
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
              ) * prices[getAddress(zeroAddress)]
            }
            actionButtonProps={{
              disabled:
                !userAddress ||
                !inputCurrency ||
                !outputCurrency ||
                !inputCurrencyAmount ||
                !feeData ||
                !feeData.gasPrice ||
                !data,
              onClick: async () => {
                if (
                  !userAddress ||
                  !inputCurrency ||
                  !outputCurrency ||
                  !inputCurrencyAmount ||
                  !feeData ||
                  !feeData.gasPrice ||
                  !data
                ) {
                  return
                }
                await swap(
                  inputCurrency,
                  parseUnits(
                    inputCurrencyAmount,
                    inputCurrency?.decimals ?? 18,
                  ),
                  outputCurrency,
                  parseFloat(slippageInput),
                  feeData.gasPrice,
                  userAddress,
                )
              },
              text: 'Swap',
            }}
          />
        </div>
        <div className="flex flex-col rounded-2xl bg-gray-900 p-6">
          <PathVizViewer pathVizData={data?.pathViz} />
        </div>
      </div>
    </div>
  )
}
