import { arbitrumSepolia, base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { mitosisTestnet } from './chains/mitosis-testnet-chain'

export const DEFAULT_CHAIN_ID = base.id

export const supportChains: Chain[] = [
  base,
  arbitrumSepolia,
  zkSync,
  {
    ...mitosisTestnet,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
  },
]

export const testnetChainIds: number[] = [arbitrumSepolia.id, mitosisTestnet.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
