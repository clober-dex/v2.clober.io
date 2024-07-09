import React from 'react'
import { useRouter } from 'next/router'

import { Pool } from '../model/pool'
import { useChainContext } from '../contexts/chain-context'
import { CurrencyIcon } from '../components/icon/currency-icon'

export const PoolManagerContainer = ({ pool }: { pool: Pool }) => {
  const { selectedChain } = useChainContext()
  const router = useRouter()

  return (
    <div className="flex w-full h-full justify-center mt-8 md:mt-16">
      <div className="w-full lg:w-[992px] h-full flex flex-col items-start gap-8 md:gap-12 px-4 lg:px-0">
        <div className="flex w-full h-full items-center">
          <button
            onClick={() => router.push(`/pool?chain=${selectedChain.id}`)}
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
        <div className="h-[592px] flex flex-col lg:flex-row items-center gap-8 self-stretch text-white">
          <div className="flex flex-col h-full w-full md:w-[480px] items-start gap-8 md:gap-12">
            <div className="flex flex-col item-st gap-3 md:gap-4 self-stretch">
              <div className="text-white text-sm md:text-base font-bold">
                Token Price
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
                    $612,384
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
                    $1.00
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:gap-4 self-stretch">
              <div className="text-white text-sm md:text-base font-bold">
                Performance Chart
              </div>
              <div className="hidden md:flex w-full items-center gap-3 self-stretch">
                <div className="flex text-gray-500 text-sm font-semibold">
                  Sort by date
                </div>
                <button className="w-[118px] h-9 px-4 py-2 bg-gray-800 rounded-xl justify-center items-center gap-2 flex">
                  <div className="opacity-90 text-center text-white text-sm font-semibold">
                    13.05.24
                  </div>
                </button>
                <div className="w-[10px] opacity-90 text-center text-white text-sm font-semibold">
                  ~
                </div>
                <button className="w-[118px] h-9 px-4 py-2 bg-gray-800 rounded-xl justify-center items-center gap-2 flex">
                  <div className="opacity-90 text-center text-white text-sm font-semibold">
                    13.05.24
                  </div>
                </button>
                <button className="w-[102px] h-9 px-4 py-2 rounded-xl border-2 border-blue-500 border-solid justify-center items-center gap-2 flex">
                  <div className="opacity-90 text-center text-blue-500 text-sm font-bold">
                    View
                  </div>
                </button>
              </div>
              <img
                className="hidden md:flex w-[480px] h-80 rounded-2xl"
                src="https://via.placeholder.com/480x320"
              />
              <img
                className="flex md:hidden w-[328px] h-60 rounded-2xl"
                src="https://via.placeholder.com/328x240"
              />
            </div>
          </div>
          <div className="flex h-full w-full md:w-[480px]">Right</div>
        </div>
      </div>
    </div>
  )
}
