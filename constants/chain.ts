import { base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { mitosisTestnet } from './chains/mitosis-testnet-chain'

export const DEFAULT_CHAIN_ID = base.id

export const supportChains: Chain[] = [
  base,
  zkSync,
  {
    ...mitosisTestnet,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
  },
]

export const testnetChainIds: number[] = [mitosisTestnet.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
