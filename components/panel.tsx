import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { NextRouter } from 'next/router'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { TwitterLogoSvg } from './svg/twitter-logo-svg'
import { DiscordLogoSvg } from './svg/discord-logo-svg'
import { DocsIconSvg } from './svg/docs-icon-svg'
import { SwapPageSvg } from './svg/swap-page-svg'
import { PageButton } from './button/page-button'
import { LimitPageSvg } from './svg/limit-page-svg'
import { VaultPageSvg } from './svg/vault-page-svg'

const Panel = ({
  chainId,
  open,
  setOpen,
  router,
}: {
  chainId: CHAIN_IDS
  open: boolean
  setOpen: (open: boolean) => void
  router: NextRouter
} & React.PropsWithChildren) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={setOpen}>
        <div className="fixed inset-0 bg-transparent bg-opacity-5 backdrop-blur-sm" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto max-w-md">
                  <div className="flex h-full flex-col bg-[#171B24] shadow-xl">
                    <div className="flex items-center px-4 h-12 justify-end">
                      <div className="flex items-start">
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="relative rounded-md text-gray-400 hover:text-gray-500 outline-none"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col text-white text-base font-bold relative mb-6 flex-1 pl-8 pr-16 gap-[40px]">
                      <div className="flex flex-col gap-8 items-start">
                        <PageButton
                          disabled={
                            router.pathname === '/limit' ||
                            router.pathname === '/swap'
                          }
                          onClick={() => {
                            router.push(`/limit?chain=${chainId}`)
                            setOpen(false)
                          }}
                        >
                          <LimitPageSvg className="w-4 h-4" />
                          Trade
                        </PageButton>

                        <PageButton
                          disabled={router.pathname === '/earn'}
                          onClick={() => {
                            router.push(`/earn?chain=${chainId}`)
                            setOpen(false)
                          }}
                        >
                          <VaultPageSvg className="w-4 h-4" />
                          Earn
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
                          Governance
                        </PageButton>
                      </div>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="192"
                        height="2"
                        viewBox="0 0 192 2"
                        fill="none"
                      >
                        <path
                          d="M0 1H192"
                          strokeWidth="1.5"
                          className="stroke-gray-600"
                        />
                      </svg>
                      <div className="flex flex-col gap-8">
                        <Link
                          className="link"
                          target="_blank"
                          href="https://docs.clober.io/"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <DocsIconSvg className="w-4 h-4" />
                            Docs
                          </div>
                        </Link>
                        <Link
                          className="link"
                          target="_blank"
                          href="https://twitter.com/CloberDEX"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <TwitterLogoSvg className="w-4 h-4" />
                            Twitter
                          </div>
                        </Link>
                        <Link
                          className="link"
                          target="_blank"
                          href="https://discord.gg/clober-dex"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row gap-2 items-center">
                            <DiscordLogoSvg className="w-4 h-4" />
                            Discord
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Panel
