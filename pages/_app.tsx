import React, { useCallback, useEffect, useState } from 'react'
import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import {
  configureChains,
  createConfig,
  useQuery,
  useQueryClient,
  WagmiConfig,
} from 'wagmi'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import {
  enkryptWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  trustWallet,
  xdefiWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { getSubgraphBlockNumber } from '@clober/v2-sdk'

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
import { CurrencyProvider } from '../contexts/currency-context'
import { PoolProvider } from '../contexts/pool/pool-context'
import { PoolContractProvider } from '../contexts/pool/pool-contract-context'

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

const PROJECT_ID = '14e09398dd595b0d1dccabf414ac4531'
const { wallets } = getDefaultWallets({
  appName: 'Clober Dex',
  projectId: PROJECT_ID,
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Popular',
    wallets: [
      rabbyWallet({ chains }),
      phantomWallet({ chains }),
      okxWallet({ chains, projectId: PROJECT_ID }),
    ],
  },
  {
    groupName: 'The others',
    wallets: [
      enkryptWallet({ chains }),
      trustWallet({ chains, projectId: PROJECT_ID }),
      xdefiWallet({ chains }),
      zerionWallet({ chains, projectId: PROJECT_ID }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

const CacheProvider = ({ children }: React.PropsWithChildren) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    localStorage.removeItem('wagmi.cache')
  }, [queryClient])

  return <>{children}</>
}

const WalletProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={supportChains} theme={darkTheme()}>
        <CacheProvider>{children}</CacheProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
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

const PoolProvidersWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <PoolProvider>
      <PoolContractProvider>{children}</PoolContractProvider>
    </PoolProvider>
  )
}

const PanelWrapper = ({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
} & React.PropsWithChildren) => {
  const router = useRouter()
  const { selectedChain } = useChainContext()

  return (
    <Panel
      chainId={selectedChain.id}
      open={open}
      setOpen={setOpen}
      router={router}
    >
      {children}
    </Panel>
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
            onClick={() => router.push(`/limit?chain=${selectedChain.id}`)}
          >
            Limit
          </button>
          <button
            className="flex font-bold items-center justify-center text-base sm:text-2xl w-16 sm:w-[120px] bg-transparent text-gray-500 disabled:text-white border-0 rounded-none p-2 border-b-4 border-b-transparent border-t-4 border-t-transparent disabled:border-b-white"
            disabled={router.pathname === '/swap'}
            onClick={() => {
              if (!testnetChainIds.includes(selectedChain.id)) {
                router.push(`/swap?chain=${selectedChain.id}`)
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

const FooterWrapper = () => {
  const { selectedChain } = useChainContext()
  const { data: latestSubgraphBlockNumber } = useQuery(
    ['latest-subgraph-block-number', selectedChain.id],
    async () => {
      return getSubgraphBlockNumber({ chainId: selectedChain.id })
    },
    {
      initialData: 0,
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  )

  return <Footer latestSubgraphBlockNumber={latestSubgraphBlockNumber} />
}

function App({ Component, pageProps }: AppProps) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const router = useRouter()

  const handlePopState = useCallback(async () => {
    if (history.length > 1) {
      setHistory((previous) => previous.slice(0, previous.length - 1))
      router.push(history[history.length - 2])
    }
  }, [history, router])

  useEffect(() => {
    setHistory((previous) => [...previous, router.asPath])
  }, [router.asPath])

  useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  return (
    <>
      <ErrorBoundary>
        <Head>
          <title>Clober | Fully On-chain Order Book</title>
          <meta
            content="Join Clober DEX and Start Trading on a Fully On-chain Order Book. Eliminate Counterparty Risk. Place Limit Orders. Low Transaction Costs Powered by LOBSTER."
            name="description"
          />
          <link rel="apple-touch-icon" href="/favicon.png" />
          <link rel="icon" type="image/png" href="/favicon.png" />
        </Head>
        <WalletProvider>
          <TransactionProvider>
            <ChainProvider>
              <CurrencyProvider>
                {router.pathname.includes('/earn') ? (
                  <PoolProvidersWrapper>
                    <div className="flex flex-col w-full min-h-[100vh] bg-gray-950">
                      <PanelWrapper open={open} setOpen={setOpen} />
                      <HeaderContainer onMenuClick={() => setOpen(true)} />

                      <Component {...pageProps} />
                    </div>
                  </PoolProvidersWrapper>
                ) : (
                  <LimitProvidersWrapper>
                    <SwapProvidersWrapper>
                      <div className="flex flex-col w-[100vw] min-h-[100vh] bg-gray-950">
                        <PanelWrapper open={open} setOpen={setOpen} />
                        <HeaderContainer onMenuClick={() => setOpen(true)} />
                        <MainComponentWrapper>
                          <Component {...pageProps} />
                        </MainComponentWrapper>
                        <FooterWrapper />
                      </div>
                    </SwapProvidersWrapper>
                  </LimitProvidersWrapper>
                )}
              </CurrencyProvider>
            </ChainProvider>
          </TransactionProvider>
        </WalletProvider>
      </ErrorBoundary>
    </>
  )
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
