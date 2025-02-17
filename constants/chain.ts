import { base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { mitosisTestnet } from './chains/mitosis-testnet-chain'
import { monadTestnet } from './chains/monad-testnet-chain'

export const DEFAULT_CHAIN_ID = monadTestnet.id

export const supportChains: Chain[] = [
  {
    ...monadTestnet,
    icon: '/monad.svg',
  },
]

export const testnetChainIds: number[] = [monadTestnet.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
