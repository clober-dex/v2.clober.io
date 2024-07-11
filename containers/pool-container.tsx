import React from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'

import { Pool, PoolPosition } from '../model/pool'
import { BERACHAIN_TESTNET_WHITELISTED_CURRENCIES } from '../constants/currencies/80085'
import { PoolCard } from '../components/card/pool-card'
import { PoolPositionCard } from '../components/card/pool-position-card'
import { useChainContext } from '../contexts/chain-context'

const pools: Pool[] = BERACHAIN_TESTNET_WHITELISTED_CURRENCIES.map(
  (currency) => {
    return {
      lpCurrency: currency,
      currency0: currency,
      currency1: currency,
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    }
  },
)

const poolPositions: PoolPosition[] = Array.from({ length: 5 }).map(
  (_, index) => {
    return {
      lp: BERACHAIN_TESTNET_WHITELISTED_CURRENCIES[index],
      pool: pools[index],
      amount: 1001234000000000000n,
      value: 123441.3241,
    }
  },
)

export const PoolContainer = () => {
  const router = useRouter()
  const { address: userAddress } = useAccount()
  const { selectedChain } = useChainContext()

  const [tab, setTab] = React.useState<'my-liquidity' | 'pool'>('pool')

  return (
    <div className="w-full flex flex-col text-white mb-4">
      <div className="flex justify-center w-auto sm:h-[400px] bg-gradient-to-t from-slate-900 to-slate-900">
        <div className="w-[960px] mt-8 sm:mt-16 flex flex-col sm:gap-12 items-center">
          <div className="flex w-[261px] h-12 sm:h-[72px] flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold">
              Pool
            </div>
            <div className="self-stretch text-center text-gray-400 text-xs sm:text-sm font-bold">
              Provide liquidity and earn fees!
            </div>
          </div>
          <div className="flex w-full h-20 mt-6 sm:mt-0 sm:h-28 px-4 justify-start items-center gap-3 sm:gap-4">
            <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex">
              <div className="text-center text-gray-400 text-sm font-semibold">
                TVL
              </div>
              <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
                $612,384
              </div>
            </div>
            <div className="grow shrink basis-0 h-full px-6 py-4 sm:px-8 sm:py-6 bg-[rgba(96,165,250,0.10)] rounded-xl sm:rounded-2xl flex-col justify-center items-center gap-3 inline-flex">
              <div className="text-center text-gray-400 text-sm font-semibold">
                24h Volume
              </div>
              <div className="self-stretch text-center text-white text-lg sm:text-2xl font-bold">
                $31,582
              </div>
            </div>
          </div>
          <div className="flex w-full mt-8 sm:mt-0 sm:mr-auto px-4">
            <div className="w-full sm:w-[328px] h-[40px] sm:h-[56px] items-center flex">
              <button
                onClick={() => setTab('pool')}
                disabled={tab === 'pool'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full disabled:bg-gray-950 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 sm:w-6 sm:h-6"
                >
                  <path
                    d="M2 20C2.22717 20.3165 2.52797 20.5729 2.87642 20.7472C3.22488 20.9214 3.6105 21.0082 4 21C4.3895 21.0082 4.77512 20.9214 5.12358 20.7472C5.47203 20.5729 5.77283 20.3165 6 20C6.22717 19.6835 6.52797 19.4271 6.87642 19.2528C7.22488 19.0786 7.6105 18.9918 8 19C8.3895 18.9918 8.77512 19.0786 9.12358 19.2528C9.47203 19.4271 9.77283 19.6835 10 20C10.2272 20.3165 10.528 20.5729 10.8764 20.7472C11.2249 20.9214 11.6105 21.0082 12 21C12.3895 21.0082 12.7751 20.9214 13.1236 20.7472C13.472 20.5729 13.7728 20.3165 14 20C14.2272 19.6835 14.528 19.4271 14.8764 19.2528C15.2249 19.0786 15.6105 18.9918 16 19C16.3895 18.9918 16.7751 19.0786 17.1236 19.2528C17.472 19.4271 17.7728 19.6835 18 20C18.2272 20.3165 18.528 20.5729 18.8764 20.7472C19.2249 20.9214 19.6105 21.0082 20 21C20.3895 21.0082 20.7751 20.9214 21.1236 20.7472C21.472 20.5729 21.7728 20.3165 22 20M2 16C2.22717 16.3165 2.52797 16.5729 2.87642 16.7472C3.22488 16.9214 3.6105 17.0082 4 17C4.3895 17.0082 4.77512 16.9214 5.12358 16.7472C5.47203 16.5729 5.77283 16.3165 6 16C6.22717 15.6835 6.52797 15.4271 6.87642 15.2528C7.22488 15.0786 7.6105 14.9918 8 15C8.3895 14.9918 8.77512 15.0786 9.12358 15.2528C9.47203 15.4271 9.77283 15.6835 10 16C10.2272 16.3165 10.528 16.5729 10.8764 16.7472C11.2249 16.9214 11.6105 17.0082 12 17C12.3895 17.0082 12.7751 16.9214 13.1236 16.7472C13.472 16.5729 13.7728 16.3165 14 16C14.2272 15.6835 14.528 15.4271 14.8764 15.2528C15.2249 15.0786 15.6105 14.9918 16 15C16.3895 14.9918 16.7751 15.0786 17.1236 15.2528C17.472 15.4271 17.7728 15.6835 18 16C18.2272 16.3165 18.528 16.5729 18.8764 16.7472C19.2249 16.9214 19.6105 17.0082 20 17C20.3895 17.0082 20.7751 16.9214 21.1236 16.7472C21.472 16.5729 21.7728 16.3165 22 16M15 12V4.5C15 4.10218 15.158 3.72064 15.4393 3.43934C15.7206 3.15804 16.1022 3 16.5 3C16.8978 3 17.2794 3.15804 17.5607 3.43934C17.842 3.72064 18 4.10218 18 4.5M9 12V4.5C9 4.10218 8.84196 3.72064 8.56066 3.43934C8.27936 3.15804 7.89782 3 7.5 3C7.10218 3 6.72064 3.15804 6.43934 3.43934C6.15804 3.72064 6 4.10218 6 4.5M15 5H9M9 10H15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-center text-white text-sm sm:text-base font-bold">
                  Pool
                </div>
              </button>
              <button
                onClick={() => userAddress && setTab('my-liquidity')}
                disabled={tab === 'my-liquidity'}
                className="flex flex-1 gap-2 items-center justify-center w-full h-full disabled:bg-gray-950 bg-transparent rounded-tl-2xl rounded-tr-2xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 sm:w-6 sm:h-6"
                >
                  <path
                    d="M11.9998 17.75L5.82784 20.995L7.00684 14.122L2.00684 9.25495L8.90684 8.25495L11.9928 2.00195L15.0788 8.25495L21.9788 9.25495L16.9788 14.122L18.1578 20.995L11.9998 17.75Z"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-center text-gray-500 text-sm sm:text-base font-bold">
                  My Liquidity
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-auto flex-col items-center mt-6 lg:mt-12 px-4 lg:px-0">
        <div className="flex flex-col w-full lg:w-[960px] h-full gap-6">
          {tab === 'pool' ? (
            <>
              <div className="hidden lg:flex self-stretch px-4 justify-start items-center gap-4">
                <div className="w-60 text-gray-400 text-sm font-semibold">
                  Pool
                </div>
                <div className="w-[140px] text-gray-400 text-sm font-semibold">
                  APY
                </div>
                <div className="w-[140px] text-gray-400 text-sm font-semibold">
                  Total Liquidity
                </div>
                <div className="w-[140px] text-gray-400 text-sm font-semibold">
                  24h Volume
                </div>
              </div>
              <div className="relative flex justify-center w-full h-full lg:h-[360px]">
                <div className="lg:absolute lg:top-0 lg:overflow-x-scroll w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:flex gap-3">
                  {pools.map((pool, index) => (
                    <PoolCard
                      chainId={selectedChain.id}
                      key={index}
                      pool={pool}
                      router={router}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full items-center flex flex-1 flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-[18px]">
              {poolPositions.map((poolPosition, index) => (
                <PoolPositionCard key={index} poolPosition={poolPosition} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
