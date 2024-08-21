import { arbitrumSepolia, base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { beraTestnetChain } from './dev-chain'

export const DEFAULT_CHAIN_ID = base.id

export const supportChains: Chain[] = [
  base,
  arbitrumSepolia,
  {
    ...beraTestnetChain,
    icon: 'https://img.cryptorank.io/coins/berachain1681996075164.png',
  },
  zkSync,
]

export const testnetChainIds = [arbitrumSepolia.id, beraTestnetChain.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
