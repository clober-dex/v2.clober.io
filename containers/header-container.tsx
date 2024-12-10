import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'

import { useChainContext } from '../contexts/chain-context'
import ChainSelector from '../components/selector/chain-selector'
import { WalletSelector } from '../components/selector/wallet-selector'
import { supportChains } from '../constants/chain'
import { DocsIconSvg } from '../components/svg/docs-icon-svg'
import { DiscordIconSvg } from '../components/svg/discord-icon-svg'
import { TwitterLogoSvg } from '../components/svg/twitter-logo-svg'
import MenuSvg from '../components/svg/menu-svg'
import { LimitPageSvg } from '../components/svg/limit-page-svg'
import { PageButton } from '../components/button/page-button'
import { VaultPageSvg } from '../components/svg/vault-page-svg'

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
          <PageButton
            disabled={
              router.pathname === '/limit' || router.pathname === '/swap'
            }
            onClick={() => {
              router.push(`/limit?chain=${selectedChain.id}`)
            }}
          >
            <LimitPageSvg className="w-4 h-4" />
            <div className="text-sm text-gray-500 font-semibold group-disabled:text-white">
              Trade
            </div>
          </PageButton>

          <PageButton
            disabled={false /* TODO: router.pathname === '/earn' */}
            onClick={() => {
              // router.push(`/earn?chain=${selectedChain.id}`)
            }}
          >
            <VaultPageSvg className="w-4 h-4" />
            <div className="text-sm text-gray-500 font-semibold group-disabled:text-white">
              Earn
            </div>
          </PageButton>

          <PageButton
            disabled={false}
            onClick={() => {
              // router.push(`/governance?chain=${chainId}`)
              // setOpen(false)
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4.04241 4.69475L4.04239 4.69478L2.02839 7.71778L2.02834 7.71775L2.02714 7.71975C1.97944 7.79916 1.95304 7.88954 1.95052 7.98214L1.9505 7.98214L1.9505 7.9835L1.95 13.5C1.95 13.6459 2.00795 13.7858 2.11109 13.8889C2.21424 13.9921 2.35413 14.05 2.5 14.05H13.5C13.6459 14.05 13.7858 13.9921 13.8889 13.8889C13.9921 13.7858 14.05 13.6459 14.05 13.5L14.0495 7.9835L14.0495 7.9835L14.0495 7.98214C14.047 7.88954 14.0206 7.79916 13.9729 7.71975L13.9729 7.71972L13.9716 7.71778L11.9576 4.69478L11.9576 4.69475C11.9074 4.61945 11.8393 4.55771 11.7595 4.51501C11.6796 4.47232 11.5905 4.44999 11.5 4.45H10.05V1.5C10.05 1.35413 9.99205 1.21424 9.88891 1.11109C9.78576 1.00795 9.64587 0.95 9.5 0.95H6.5C6.35413 0.95 6.21424 1.00795 6.11109 1.11109C6.00795 1.21424 5.95 1.35413 5.95 1.5V4.45H4.50001C4.50001 4.45 4.5 4.45 4.5 4.45C4.40948 4.44999 4.32035 4.47232 4.24053 4.51501C4.1607 4.55771 4.09265 4.61945 4.04241 4.69475ZM3.05 12.95V8.55H12.95V12.95H3.05ZM10.05 6V5.55H11.2057L12.4721 7.45H3.52791L4.79426 5.55H5.95V6C5.95 6.14587 6.00795 6.28576 6.11109 6.38891C6.21424 6.49205 6.35413 6.55 6.5 6.55H9.5C9.64587 6.55 9.78576 6.49205 9.88891 6.38891C9.99205 6.28576 10.05 6.14587 10.05 6ZM8.95 2.05V5.45H7.05V2.05H8.95Z"
                strokeWidth="0.1"
                className="stroke-gray-500 fill-gray-500 group-disabled:stroke-blue-500 group-disabled:fill-blue-500"
              />
            </svg>
            <div className="text-sm text-gray-500 font-semibold group-disabled:text-white">
              Governance
            </div>
          </PageButton>
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
        <button
          className="w-8 h-8 lg:hover:bg-gray-200 hover:bg-gray-700 rounded sm:rounded-lg flex items-center justify-center lg:hidden"
          onClick={onMenuClick}
        >
          <MenuSvg />
        </button>
      </div>
    </div>
  )
}

export default HeaderContainer
