import React, { useEffect, useState } from 'react'
import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { configureChains, createConfig, useAccount, WagmiConfig } from 'wagmi'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { identify } from '@web3analytic/funnel-sdk'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import HeaderContainer from '../containers/header-container'
import Footer from '../components/footer'
import { ChainProvider, useChainContext } from '../contexts/chain-context'
import { MarketProvider } from '../contexts/limit/market-context'
import { supportChains, testnetChainIds } from '../constants/chain'
import { toWagmiChain } from '../model/chain'
import { TransactionProvider } from '../contexts/transaction-context'
import { LimitProvider } from '../contexts/limit/limit-context'
import { SwapProvider } from '../contexts/swap/swap-context'
import { OpenOrderProvider } from '../contexts/limit/open-order-context'
import { LimitContractProvider } from '../contexts/limit/limit-contract-context'
import { SwapContractProvider } from '../contexts/swap/swap-contract-context'
import Panel from '../components/panel'
import { RPC_URL } from '../constants/rpc-urls'
import ErrorBoundary from '../components/error-boundary'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  supportChains.map((chain) => toWagmiChain(chain)),
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: RPC_URL[chain.id],
      }),
    }),
  ],
  { rank: true },
)

const { connectors } = getDefaultWallets({
  appName: 'Clober Dex',
  projectId: '14e09398dd595b0d1dccabf414ac4531',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

const WalletProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={supportChains} theme={darkTheme()}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

const Web3AnalyticWrapper = ({ children }: React.PropsWithChildren) => {
  const { address } = useAccount()

  useEffect(() => {
    if (!address) {
      return
    }
    identify(process.env.NEXT_PUBLIC_WEB3_ANALYTIC_API_KEY || '', address)
  }, [address])

  return <>{children}</>
}

const LimitProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <OpenOrderProvider>
      <LimitContractProvider>
        <LimitProvider>
          <MarketProvider>{children}</MarketProvider>
        </LimitProvider>
      </LimitContractProvider>
    </OpenOrderProvider>
  )
}

const SwapProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <SwapProvider>
      <SwapContractProvider>{children}</SwapContractProvider>
    </SwapProvider>
  )
}

const MainComponentWrapper = ({ children }: React.PropsWithChildren) => {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  return (
    <div className="flex flex-1 relative justify-center bg-gray-950">
      <div className="flex w-full flex-col items-center gap-4 sm:gap-6 p-4 pb-0">
        <div className={`relative flex gap-4 mt-14`}>
          <button
            className="flex font-bold items-center justify-center text-base sm:text-2xl w-16 sm:w-[120px] bg-transparent text-gray-500 disabled:text-white border-0 rounded-none p-2 border-b-4 border-b-transparent border-t-4 border-t-transparent disabled:border-b-white"
            disabled={router.pathname === '/limit'}
            onClick={() =>
              router.replace(`/limit?chain=${selectedChain.id}`, undefined, {
                shallow: true,
              })
            }
          >
            Limit
          </button>
          <button
            className="flex font-bold items-center justify-center text-base sm:text-2xl w-16 sm:w-[120px] bg-transparent text-gray-500 disabled:text-white border-0 rounded-none p-2 border-b-4 border-b-transparent border-t-4 border-t-transparent disabled:border-b-white"
            disabled={router.pathname === '/swap'}
            onClick={() => {
              if (!testnetChainIds.includes(selectedChain.id)) {
                router.replace(`/swap?chain=${selectedChain.id}`, undefined, {
                  shallow: true,
                })
              }
            }}
          >
            Swap
          </button>
        </div>
        {children}
      </div>
      <div className="absolute w-full h-[30%] bottom-0 bg-gradient-to-t from-blue-500 to-transparent opacity-[15%] pointer-events-none" />
    </div>
  )
}

function App({ Component, pageProps }: AppProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  console.log(router.pathname)
  return (
    <>
      <ErrorBoundary>
        <Head>
          <meta
            content="Join Clober DEX and Start Trading on a Fully On-chain Order Book. Eliminate Counterparty Risk. Place Limit Orders. Low Transaction Costs Powered by LOBSTER."
            name="description"
          />
          <link href="/favicon.svg" rel="icon" />
        </Head>
        <WalletProvider>
          <Web3AnalyticWrapper>
            <TransactionProvider>
              <ChainProvider>
                <LimitProvidersWrapper>
                  {router.pathname === '/iframe' ? (
                    <div className="flex flex-col w-full min-h-[100vh] bg-gray-950">
                      <HeaderContainer onMenuClick={() => setOpen(true)} />

                      <div className="flex flex-1 relative justify-center bg-gray-950">
                        <div className="flex w-full flex-col items-center gap-4 sm:gap-6 p-4 pb-0">
                          <Component {...pageProps} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <SwapProvidersWrapper>
                      <div className="flex flex-col w-[100vw] min-h-[100vh] bg-gray-950">
                        <Panel open={open} setOpen={setOpen} />
                        <HeaderContainer onMenuClick={() => setOpen(true)} />
                        <MainComponentWrapper>
                          <Component {...pageProps} />
                        </MainComponentWrapper>
                        <Footer />
                      </div>
                    </SwapProvidersWrapper>
                  )}
                </LimitProvidersWrapper>
              </ChainProvider>
            </TransactionProvider>
          </Web3AnalyticWrapper>
        </WalletProvider>
      </ErrorBoundary>
    </>
  )
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
