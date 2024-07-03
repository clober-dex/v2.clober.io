import { Chain as WagmiChain } from 'wagmi'

export type Chain = WagmiChain & {
  icon?: string
}

export const toWagmiChain = (chain: Chain): WagmiChain => {
  return {
    id: chain.id,
    name: chain.name,
    network: chain.network,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorers: chain.blockExplorers,
    contracts: chain.contracts,
  }
}
