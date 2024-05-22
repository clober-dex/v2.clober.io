import React from 'react'

import { textStyles } from '../../themes/text-styles'
import useDropdown from '../../hooks/useDropdown'
import ChainIcon from '../icon/chain-icon'
import { Chain } from '../../model/chain'
import { TriangleDownSvg } from '../svg/triangle-down-svg'
import { CheckSvg } from '../svg/check-svg'
import { testnetChainIds } from '../../constants/chain'

export default function ChainSelector({
  chain,
  setChain,
  chains,
}: {
  chain: Chain
  setChain: (chain: Chain) => void
  chains: Chain[]
}) {
  const { showDropdown, setShowDropdown } = useDropdown()

  const mainnetChains = chains.filter(
    (chain) => !testnetChainIds.includes(chain.id),
  )
  const testnetChains = chains.filter((chain) =>
    testnetChainIds.includes(chain.id),
  )

  return chains.find((_chain) => _chain.id === chain.id) ? (
    <div className="flex relative">
      <button
        onClick={() => {
          setShowDropdown((prev) => !prev)
        }}
        className="flex items-center justify-center lg:justify-start h-8 w-8 lg:w-auto p-0 lg:px-2 lg:gap-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
      >
        <ChainIcon chain={chain} />
        <p className={`hidden lg:block ${textStyles.body3Bold}`}>
          {chain.name}
        </p>
        <TriangleDownSvg className="hidden lg:block" />
      </button>
      {showDropdown ? (
        <ChainsDropDown
          mainnetChains={mainnetChains}
          testnetChains={testnetChains}
          chain={chain}
          setChain={setChain}
          setShowDropdown={setShowDropdown}
        />
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  )
}

function ChainsDropDown({
  mainnetChains,
  testnetChains,
  chain,
  setChain,
  setShowDropdown,
}: {
  mainnetChains: Chain[]
  testnetChains: Chain[]
  chain: Chain
  setChain: (chain: Chain) => void
  setShowDropdown: (showDropdown: boolean) => void
}) {
  if (mainnetChains.length === 0 && testnetChains.length === 0) {
    return <></>
  }

  return (
    <div className="absolute right-1 md:right-[-5rem] top-10 md:top-12 z-[1500] flex flex-col w-48 bg-gray-800 border border-solid border-gray-700 rounded-xl py-3 items-start gap-4 shadow-[4px_4px_12px_12px_rgba(0,0,0,0.15)]">
      {testnetChains.length === 0 ? (
        <ChainList
          title={'Mainnet'}
          chain={chain}
          setChain={setChain}
          chains={mainnetChains}
          setShowDropdown={setShowDropdown}
        />
      ) : mainnetChains.length === 0 ? (
        <ChainList
          title={'Testnet'}
          chain={chain}
          setChain={setChain}
          chains={testnetChains}
          setShowDropdown={setShowDropdown}
        />
      ) : (
        <>
          <ChainList
            title={'Mainnet'}
            chain={chain}
            setChain={setChain}
            chains={mainnetChains}
            setShowDropdown={setShowDropdown}
          />
          <div className="h-0 self-stretch stroke-[1px] stroke-gray-700">
            <svg>
              <line
                x1="0"
                y1="0"
                x2="158"
                y2="0"
                stroke="#374151"
                strokeWidth={1}
              />
            </svg>
          </div>
          <ChainList
            title={'Testnet'}
            chain={chain}
            setChain={setChain}
            chains={testnetChains}
            setShowDropdown={setShowDropdown}
          />
        </>
      )}
    </div>
  )
}

function ChainList({
  title,
  chain,
  setChain,
  chains,
  setShowDropdown,
}: {
  title: string
  chain: Chain
  setChain: (chain: Chain) => void
  chains: Chain[]
  setShowDropdown: (showDropdown: boolean) => void
}) {
  return (
    <div className="flex flex-col items-start gap-1 self-stretch rounded-none">
      <div
        className={`self-stretch px-4 text-gray-400 ${textStyles.body3Bold}`}
      >
        {title}
      </div>
      <div className="flex flex-col items-start self-stretch rounded-none">
        <div className="flex flex-col items-start self-stretch rounded-none">
          {chains
            .sort((a, b) => a.id - b.id)
            .map((_chain) => (
              <div
                className={`flex items-center gap-2 px-3 py-2 self-stretch cursor-pointer text-white ${textStyles.body3Bold} hover:bg-gray-600`}
                key={_chain.name}
                onClick={() => {
                  try {
                    setChain(_chain)
                  } catch (e) {
                    console.error(e)
                  } finally {
                    setShowDropdown(false)
                  }
                }}
              >
                <ChainIcon chain={_chain} />
                <span>{_chain.name}</span>
                {_chain.id === chain.id ? (
                  <CheckSvg className="ml-auto" />
                ) : (
                  <></>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
