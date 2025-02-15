import { base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { mitosisTestnet } from './chains/mitosis-testnet-chain'
import { monadTestnet } from './chains/monad-testnet-chain'

export const DEFAULT_CHAIN_ID = monadTestnet.id

export const supportChains: Chain[] = [
  base,
  zkSync,
  {
    ...mitosisTestnet,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
  },
  {
    ...monadTestnet,
    icon: '/monad.svg',
  },
]

export const testnetChainIds: number[] = [mitosisTestnet.id, monadTestnet.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
