import { arbitrumSepolia, base, zkSync } from 'viem/chains'

import { Chain } from '../model/chain'

import { beraTestnetChain } from './dev-chain'

export const supportChains: Chain[] = [
  {
    ...arbitrumSepolia,
    defaultGasPrice: 0n,
    expireIn: 240,
  },
  {
    ...beraTestnetChain,
    defaultGasPrice: 0n,
    expireIn: 240,
    icon: 'https://img.cryptorank.io/coins/berachain1681996075164.png',
  },
  {
    ...base,
    defaultGasPrice: 0n,
    expireIn: 240,
  },
  {
    ...zkSync,
    defaultGasPrice: 0n,
    expireIn: 240,
  },
]

export const testnetChainIds = [arbitrumSepolia.id, beraTestnetChain.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)
