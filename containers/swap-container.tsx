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
import { testnetChainIds } from '../constants/chain'
import { useCurrencyContext } from '../contexts/currency-context'
import { OdosLogoSvg } from '../components/svg/odos-logo-svg'
import { mitosisTestnet } from '../constants/chains/mitosis-testnet-chain'

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

  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [latestRefreshTime, setLatestRefreshTime] = useState(Date.now())

  const amountIn = parseUnits(
    inputCurrencyAmount,
    inputCurrency?.decimals ?? 18,
  )

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
    ],
    async () => {
      if (
        feeData &&
        feeData.gasPrice &&
        inputCurrency &&
        outputCurrency &&
        amountIn > 0n
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
    {
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  )

  useEffect(() => {
    setShowInputCurrencySelect(false)
  }, [selectedChain])

  const poweredByLink =
    selectedChain.id === mitosisTestnet.id
      ? 'https://www.oogabooga.io/'
      : 'https://www.odos.xyz/'

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
          {data?.pathViz ? (
            <div className="relative flex flex-col rounded-2xl bg-gray-900 p-6">
              <PathVizViewer pathVizData={data.pathViz} />
            </div>
          ) : (
            <div className="hidden min-h-[270px] h-full w-full md:w-[528px] xl:w-[648px] lg:flex flex-col rounded-2xl bg-gray-900 p-6" />
          )}
        </div>
        {!testnetChainIds.includes(selectedChain.id) ? (
          <div className="flex ml-auto text-white items-center gap-2">
            <div className="text-gray-400 text-xs font-medium">Powered by</div>
            <a target="_blank" href={poweredByLink} rel="noreferrer">
              <OdosLogoSvg />
            </a>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
