import React, { useCallback, useEffect } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

import { Chain } from '../model/chain'
import {
  DEFAULT_CHAIN_ID,
  findSupportChain,
  supportChains,
} from '../constants/chain'

type ChainContext = {
  selectedChain: Chain
  setSelectedChain: (chain: Chain) => void
}

const Context = React.createContext<ChainContext>({
  selectedChain: supportChains.find((chain) => chain.id === DEFAULT_CHAIN_ID)!,
  setSelectedChain: (_) => _,
})

export const LOCAL_STORAGE_CHAIN_KEY = 'chain'
const QUERY_PARAM_CHAIN_KEY = 'chain'

export const ChainProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { chain: connectedChain } = useNetwork()
  const [selectedChain, _setSelectedChain] = React.useState<Chain>(
    supportChains.find((chain) => chain.id === DEFAULT_CHAIN_ID)!,
  )

  const { switchNetwork } = useSwitchNetwork({
    onSuccess(data) {
      const chain = findSupportChain(data.id)
      if (chain) {
        setSelectedChain(chain)
      }
    },
  })

  const setSelectedChain = useCallback(
    (_chain: Chain) => {
      _setSelectedChain(_chain)
      localStorage.setItem(LOCAL_STORAGE_CHAIN_KEY, _chain.id.toString())
      if (switchNetwork) {
        switchNetwork(_chain.id)
      }
      window.history.replaceState({}, '', `?chain=${_chain.id}`)
    },
    [switchNetwork],
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryParamChain = params.get(QUERY_PARAM_CHAIN_KEY)
      ? findSupportChain(parseInt(params.get(QUERY_PARAM_CHAIN_KEY)!, 10))
      : undefined
    const localStorageChain = localStorage.getItem(LOCAL_STORAGE_CHAIN_KEY)
      ? findSupportChain(
          parseInt(localStorage.getItem(LOCAL_STORAGE_CHAIN_KEY)!, 10),
        )
      : undefined
    const walletConnectedChain = connectedChain
      ? findSupportChain(connectedChain.id)
      : undefined

    const chain = walletConnectedChain || queryParamChain || localStorageChain
    if (chain) {
      if (switchNetwork) {
        switchNetwork(chain.id)
      }
      setSelectedChain(chain)
    }
  }, [connectedChain, setSelectedChain, switchNetwork])

  return (
    <Context.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </Context.Provider>
  )
}

export const useChainContext = () => React.useContext(Context) as ChainContext
