import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useWalletClient } from 'wagmi'
import { addLiquidity, getQuoteToken, removeLiquidity } from '@clober/v2-sdk'
import { isAddressEqual, parseUnits, zeroAddress, zeroHash } from 'viem'
import { Tooltip } from 'react-tooltip'

import { Pool } from '../model/pool'
import { useChainContext } from '../contexts/chain-context'
import { CurrencyIcon } from '../components/icon/currency-icon'
import { AddLiquidityForm } from '../components/form/add-liquidity-form'
import { usePoolContext } from '../contexts/pool/pool-context'
import { useCurrencyContext } from '../contexts/currency-context'
import { RemoveLiquidityForm } from '../components/form/remove-liquidity-form'
import { RPC_URL } from '../constants/rpc-urls'
import { usePoolContractContext } from '../contexts/pool/pool-contract-context'
import { toPlacesAmountString } from '../utils/bignumber'
import { QuestionMarkSvg } from '../components/svg/question-mark-svg'

import { VaultChartContainer } from './vault-chart-container'

export const PoolManagerContainer = ({ pool }: { pool: Pool }) => {
  const [tab, setTab] = React.useState<'add-liquidity' | 'remove-liquidity'>(
    'add-liquidity',
  )
  const router = useRouter()
  const { data: walletClient } = useWalletClient()
  const { selectedChain } = useChainContext()
  const { balances, prices } = useCurrencyContext()
  const {
    currency0Amount,
    setCurrency0Amount,
    currency1Amount,
    setCurrency1Amount,
    disableSwap,
    setDisableSwap,
    slippageInput,
    setSlippageInput,
    lpCurrencyAmount,
    setLpCurrencyAmount,
    lpBalances,
  } = usePoolContext()
  const { mint, burn } = usePoolContractContext()

  const { data: receiveLpAmount } = useQuery(
    [
      'calculate-receive-lp-amount',
      selectedChain,
      pool.key,
      currency0Amount,
      currency1Amount,
      disableSwap,
      slippageInput,
      tab,
    ],
    async () => {
      if (tab === 'remove-liquidity') {
        return 0n
      }
      if (Number(currency0Amount) === 0 && Number(currency1Amount) === 0) {
        return 0n
      }
      const baseCurrency = isAddressEqual(
        getQuoteToken({
          chainId: selectedChain.id,
          token0: pool.currency0.address,
          token1: pool.currency1.address,
        }),
        pool.currency0.address,
      )
        ? pool.currency1
        : pool.currency0

      const { result } = await addLiquidity({
        chainId: selectedChain.id,
        token0: pool.currency0.address,
        token1: pool.currency1.address,
        salt: zeroHash,
        userAddress: zeroAddress,
        amount0: currency0Amount,
        amount1: currency1Amount,
        options: {
          useSubgraph: false,
          rpcUrl: RPC_URL[selectedChain.id],
          gasLimit: 1_000_000n,
          disableSwap,
          slippage: Number(slippageInput),
          testnetPrice: prices[baseCurrency.address] ?? 0,
        },
      })
      return parseUnits(
        result.lpCurrency.amount,
        result.lpCurrency.currency.decimals,
      )
    },
    {
      initialData: 0n,
    },
  )

  const { data: receiveCurrencies } = useQuery(
    [
      'calculate-receive-currencies',
      selectedChain,
      pool,
      lpCurrencyAmount,
      slippageInput,
      prices,
      tab,
    ],
    async () => {
      if (tab === 'add-liquidity' || Number(lpCurrencyAmount) === 0) {
        return []
      }
      const { result } = await removeLiquidity({
        chainId: selectedChain.id,
        userAddress: zeroAddress,
        token0: pool.currency0.address,
        token1: pool.currency1.address,
        salt: zeroHash,
        amount: lpCurrencyAmount,
        options: {
          useSubgraph: false,
          rpcUrl: RPC_URL[selectedChain.id],
          gasLimit: 1_000_000n,
          slippage: Number(slippageInput),
        },
      })
      return [result.currencyA, result.currencyB]
    },
    {
      initialData: [],
    },
  )

  useEffect(() => {
    setDisableSwap(pool.reserve0 + pool.reserve1 === 0)
  }, [pool.reserve0, pool.reserve1, setDisableSwap])

  useEffect(() => {
    setCurrency0Amount('')
    setCurrency1Amount('')
  }, [setCurrency0Amount, setCurrency1Amount, disableSwap])

  // when change currency0Amount
  useEffect(
    () => {
      if (!disableSwap) {
        setCurrency1Amount(
          Number(currency0Amount) / (pool.reserve0 / pool.reserve1) + '',
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency0Amount, setCurrency1Amount],
  )

  // when change currency1Amount
  useEffect(
    () => {
      if (!disableSwap) {
        setCurrency0Amount(
          Number(currency1Amount) * (pool.reserve0 / pool.reserve1) + '',
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency1Amount, setCurrency0Amount],
  )

  const latestPriceIndex = useMemo(
    () =>
      pool.historicalPriceIndex.length > 0
        ? pool.historicalPriceIndex[
            pool.historicalPriceIndex.length - 1
          ].values.reduce((sum, value) => sum + value, 0)
        : 0,
    [pool.historicalPriceIndex],
  )

  return (
    <div className="flex w-full h-full justify-center mt-8 md:mt-16 mb-4 sm:mb-6">
      <div className="w-full lg:w-[992px] h-full flex flex-col items-start gap-8 md:gap-12 px-4 lg:px-0">
        <div className="flex w-full h-full items-center">
          <button
            onClick={() => router.push(`/earn?chain=${selectedChain.id}`)}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              className="mr-auto w-6 h-6 md:w-8 md:h-8"
            >
              <path
                d="M6.66699 16.0003H25.3337M6.66699 16.0003L12.0003 21.3337M6.66699 16.0003L12.0003 10.667"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="absolute left-1/2">
            <div className="flex items-center relative -left-1/2 w-full h-full gap-2 md:gap-4">
              <div className="w-10 h-6 md:w-14 md:h-8 shrink-0 relative">
                <CurrencyIcon
                  currency={pool.currency0}
                  className="w-6 h-6 md:w-8 md:h-8 absolute left-0 top-0 z-[1]"
                />
                <CurrencyIcon
                  currency={pool.currency1}
                  className="w-6 h-6 md:w-8 md:h-8 absolute left-4 md:left-6 top-0"
                />
              </div>
              <div className="flex justify-center items-start gap-1 md:gap-2">
                <div className="text-center text-white md:text-3xl font-bold">
                  {pool.currency0.symbol}
                </div>
                <div className="text-center text-white md:text-3xl font-bold">
                  -
                </div>
                <div className="text-center text-white md:text-3xl font-bold">
                  {pool.currency1.symbol}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 self-stretch text-white">
          <div className="flex flex-col w-full sm:w-[480px] items-start gap-8 md:gap-12">
            <div className="flex flex-col item-st gap-3 md:gap-4 self-stretch">
              <div className="text-white text-sm md:text-base font-bold">
                Reserve
              </div>
              <div className="flex h-14 px-8 py-4 bg-gray-800 rounded-xl justify-center items-center gap-8 md:gap-12">
                <div className="flex justify-center gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <CurrencyIcon
                      currency={pool.currency0}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                    <div className="text-center text-gray-400 text-sm md:text-base font-semibold">
                      {pool.currency0.symbol}
                    </div>
                  </div>
                  <div className="text-center text-white text-sm md:text-lg font-bold ">
                    {toPlacesAmountString(
                      pool.reserve0.toString(),
                      prices[pool.currency0.address] ?? 0,
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <CurrencyIcon
                      currency={pool.currency1}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                    <div className="text-center text-gray-400 text-sm md:text-base font-semibold">
                      {pool.currency1.symbol}
                    </div>
                  </div>
                  <div className="text-center text-white text-sm md:text-lg font-bold ">
                    {toPlacesAmountString(
                      pool.reserve1.toString(),
                      prices[pool.currency1.address] ?? 0,
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex sm:hidden flex-col item-st gap-3 md:gap-4 self-stretch">
              <div className="flex flex-row gap-2">
                <div className="text-white text-sm md:text-base font-bold">
                  Performance Index (PI)
                </div>
                <div className="flex mr-auto justify-center items-center">
                  <QuestionMarkSvg
                    data-tooltip-id="trading-view-info"
                    data-tooltip-place="bottom-end"
                    data-tooltip-html={
                      'Performance Index (PI) shows the relative value of your portfolio over time, starting at 1. A value above 1 indicates growth, while a value below 1 indicates a decrease. PI provides a snapshot of how the assets have performed since the initial measurement.'
                    }
                    className="w-3 h-3"
                  />
                  <Tooltip
                    id="trading-view-info"
                    style={{
                      width: '300px',
                    }}
                    clickable
                  />
                </div>
              </div>
              <div className="text-sm font-semibold flex h-14 px-8 py-4 bg-gray-800 rounded-xl justify-center items-center gap-8 md:gap-12">
                {latestPriceIndex.toFixed(4)}
              </div>
            </div>
            <div className="flex-col items-start gap-3 md:gap-4 self-stretch hidden sm:flex">
              <div className="flex flex-col gap-0.5">
                <div className="text-white text-sm md:text-base font-bold">
                  Historical Performance
                </div>
                <div className="flex flex-row gap-2">
                  <div className="flex text-gray-500 text-xs md:text-sm">
                    Performance Index (PI)
                  </div>
                  <div className="flex mr-auto justify-center items-center">
                    <QuestionMarkSvg
                      data-tooltip-id="trading-view-info"
                      data-tooltip-place="bottom-end"
                      data-tooltip-html={
                        'Performance Index (PI) shows the relative value of your portfolio over time, starting at 1. A value above 1 indicates growth, while a value below 1 indicates a decrease. PI provides a snapshot of how the assets have performed since the initial measurement.'
                      }
                      className="w-3 h-3"
                    />
                    <Tooltip
                      id="trading-view-info"
                      style={{
                        width: '300px',
                      }}
                      clickable
                    />
                  </div>
                </div>
              </div>
              <VaultChartContainer
                historicalPriceIndex={pool.historicalPriceIndex}
              />
            </div>
          </div>
          <div className="h-full md:h-[576px] flex flex-col w-full sm:w-[480px] justify-start items-start gap-4">
            <div className="w-full sm:h-14 p-1.5 sm:px-2 rounded-xl md:rounded-2xl border-2 border-slate-800 border-solid justify-center items-center inline-flex">
              <button
                disabled={tab === 'add-liquidity'}
                onClick={() => setTab('add-liquidity')}
                className="whitespace-nowrap flex-1 h-8 sm:h-10 px-4 sm:px-6 py-1.5 sm:py-4 disabled:bg-slate-800 rounded-xl justify-center items-center gap-1 sm:gap-2 flex"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-4 h-4 md:w-5 md:h-5"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM11 6C11 5.44772 10.5523 5 10 5C9.44772 5 9 5.44772 9 6V9H6C5.44772 9 5 9.44772 5 10C5 10.5523 5.44772 11 6 11H9V14C9 14.5523 9.44772 15 10 15C10.5523 15 11 14.5523 11 14V11H14C14.5523 11 15 10.5523 15 10C15 9.44772 14.5523 9 14 9H11V6Z"
                    fill="white"
                  />
                </svg>
                <div className="opacity-90 text-center text-gray-400 text-sm md:text-base font-bold">
                  Add Liquidity
                </div>
              </button>
              <button
                disabled={tab === 'remove-liquidity'}
                onClick={() => setTab('remove-liquidity')}
                className="whitespace-nowrap flex-1 h-8 sm:h-10 px-4 sm:px-6 py-1.5 sm:py-4 disabled:bg-slate-800 rounded-xl justify-center items-center gap-1 sm:gap-2 flex"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-4 h-4 md:w-5 md:h-5"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM6 9C5.44772 9 5 9.44772 5 10C5 10.5523 5.44772 11 6 11H14C14.5523 11 15 10.5523 15 10C15 9.44772 14.5523 9 14 9H6Z"
                    fill="#9CA3AF"
                  />
                </svg>
                <div className="opacity-90 text-center text-gray-400 text-sm md:text-base font-bold">
                  Remove Liquidity
                </div>
              </button>
            </div>
            <div className="p-6 bg-gray-900 rounded-2xl border flex-col justify-start items-start gap-6 md:gap-8 flex w-full">
              {tab === 'add-liquidity' ? (
                <AddLiquidityForm
                  pool={pool}
                  prices={prices}
                  currency0Amount={currency0Amount}
                  setCurrency0Amount={setCurrency0Amount}
                  availableCurrency0Balance={
                    balances[pool.currency0.address] ?? 0n
                  }
                  currency1Amount={currency1Amount}
                  setCurrency1Amount={setCurrency1Amount}
                  availableCurrency1Balance={
                    balances[pool.currency1.address] ?? 0n
                  }
                  disableSwap={disableSwap}
                  setDisableSwap={setDisableSwap}
                  disableDisableSwap={pool.reserve0 + pool.reserve1 === 0}
                  slippageInput={slippageInput}
                  setSlippageInput={setSlippageInput}
                  receiveLpCurrencyAmount={receiveLpAmount}
                  isCalculatingReceiveLpAmount={
                    (!disableSwap &&
                      Number(currency0Amount) > 0 &&
                      Number(currency1Amount) > 0 &&
                      receiveLpAmount === 0n) ||
                    (disableSwap &&
                      Number(currency0Amount) + Number(currency1Amount) > 0 &&
                      receiveLpAmount === 0n)
                  }
                  actionButtonProps={{
                    disabled:
                      !walletClient ||
                      (Number(currency0Amount) === 0 &&
                        Number(currency1Amount) === 0) ||
                      parseUnits(currency0Amount, pool.currency0.decimals) >
                        balances[pool.currency0.address] ||
                      parseUnits(currency1Amount, pool.currency1.decimals) >
                        balances[pool.currency1.address] ||
                      (!disableSwap &&
                        (Number(currency0Amount) === 0 ||
                          Number(currency1Amount) === 0)),
                    onClick: async () => {
                      await mint(
                        pool.currency0,
                        pool.currency1,
                        currency0Amount,
                        currency1Amount,
                        disableSwap,
                        Number(slippageInput),
                      )
                    },
                    text: !walletClient
                      ? 'Connect wallet'
                      : Number(currency0Amount) === 0 &&
                        Number(currency1Amount) === 0
                      ? 'Enter amount'
                      : parseUnits(currency0Amount, pool.currency0.decimals) >
                        balances[pool.currency0.address]
                      ? `Insufficient ${pool.currency0.symbol} balance`
                      : parseUnits(currency1Amount, pool.currency1.decimals) >
                        balances[pool.currency1.address]
                      ? `Insufficient ${pool.currency1.symbol} balance`
                      : !disableSwap &&
                        (Number(currency0Amount) === 0 ||
                          Number(currency1Amount) === 0)
                      ? `Enter amount`
                      : `Add Liquidity`,
                  }}
                />
              ) : (
                <RemoveLiquidityForm
                  pool={pool}
                  prices={{
                    ...prices,
                    [pool.lpCurrency.address]: pool.lpUsdValue,
                  }}
                  lpCurrencyAmount={lpCurrencyAmount}
                  setLpCurrencyAmount={setLpCurrencyAmount}
                  availableLpCurrencyBalance={lpBalances[pool.key] ?? 0n}
                  receiveCurrencies={
                    receiveCurrencies.length === 2
                      ? [
                          {
                            currency: receiveCurrencies[0].currency,
                            amount: parseUnits(
                              receiveCurrencies[0].amount,
                              receiveCurrencies[0].currency.decimals,
                            ),
                          },
                          {
                            currency: receiveCurrencies[1].currency,
                            amount: parseUnits(
                              receiveCurrencies[1].amount,
                              receiveCurrencies[1].currency.decimals,
                            ),
                          },
                        ]
                      : [
                          {
                            currency: pool.currency0,
                            amount: 0n,
                          },
                          {
                            currency: pool.currency1,
                            amount: 0n,
                          },
                        ]
                  }
                  slippageInput={slippageInput}
                  setSlippageInput={setSlippageInput}
                  isCalculatingReceiveCurrencies={
                    Number(lpCurrencyAmount) > 0 &&
                    receiveCurrencies.length === 0
                  }
                  actionButtonProps={{
                    disabled:
                      !walletClient ||
                      Number(lpCurrencyAmount) === 0 ||
                      parseUnits(lpCurrencyAmount, 18) > lpBalances[pool.key],
                    onClick: async () => {
                      await burn(
                        pool.currency0,
                        pool.currency1,
                        lpCurrencyAmount,
                        slippageInput,
                      )
                    },
                    text: !walletClient
                      ? 'Connect wallet'
                      : Number(lpCurrencyAmount) === 0
                      ? 'Enter amount'
                      : parseUnits(lpCurrencyAmount, 18) > lpBalances[pool.key]
                      ? `Insufficient ${pool.lpCurrency.symbol} balance`
                      : `Remove Liquidity`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
