import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'

import { useChainContext } from '../contexts/chain-context'
import ChainSelector from '../components/selector/chain-selector'
import { WalletSelector } from '../components/selector/wallet-selector'
import { supportChains } from '../constants/chain'
import MenuSvg from '../components/svg/menu-svg'
import { DocsIconSvg } from '../components/svg/docs-icon-svg'
import { DiscordIconSvg } from '../components/svg/discord-icon-svg'
import { TwitterLogoSvg } from '../components/svg/twitter-logo-svg'

const HeaderContainer = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const router = useRouter()
  const { selectedChain, setSelectedChain } = useChainContext()
  const { address, status } = useAccount()

  return (
    <div className="flex items-center justify-between h-12 md:h-16 py-0 px-4">
      <div className="flex items-center gap-4 md:gap-12">
        <Link
          className={`flex gap-2 items-center`}
          target="_blank"
          href="https://clober.io"
          rel="noreferrer"
        >
          <img className="h-5 md:h-7" src="/logo.svg" alt="logo" />
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          <button
            disabled={
              router.pathname === '/limit' || router.pathname === '/swap'
            }
            onClick={() => router.push(`/limit?chain=${selectedChain.id}`)}
            className="text-sm text-gray-500 font-semibold disabled:text-white"
          >
            Trade
          </button>
          <button
            disabled={true /*TODO: router.pathname.includes('/pool')*/}
            onClick={() => router.push(`/pool?chain=${selectedChain.id}`)}
            // className="text-sm text-gray-500 font-semibold disabled:text-white"
            className="text-sm text-gray-500 font-semibold"
          >
            Pool
          </button>
        </div>
      </div>
      <div className="flex gap-2 w-auto md:gap-4 ml-auto">
        <div className="hidden lg:flex items-center justify-center mr-2 gap-4">
          <Link
            className="link"
            target="_blank"
            href="https://docs.clober.io/"
            rel="noreferrer"
          >
            <DocsIconSvg className="w-5 h-5" />
          </Link>
          <Link
            className="link"
            target="_blank"
            href="https://discord.gg/clober-dex"
            rel="noreferrer"
          >
            <DiscordIconSvg className="w-5 h-5" />
          </Link>
          <Link
            className="link"
            target="_blank"
            href="https://twitter.com/CloberDEX"
            rel="noreferrer"
          >
            <TwitterLogoSvg className="w-5 h-5" />
          </Link>
        </div>
        <ChainSelector
          chain={selectedChain}
          setChain={setSelectedChain}
          chains={supportChains}
        />
        <WalletSelector address={address} status={status} />
        {router.pathname !== '/iframe' ? (
          <button
            className="w-8 h-8 lg:hover:bg-gray-200 hover:bg-gray-700 rounded sm:rounded-lg flex items-center justify-center lg:hidden"
            onClick={onMenuClick}
          >
            <MenuSvg />
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default HeaderContainer
