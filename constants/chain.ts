import { arbitrumSepolia } from 'viem/chains'

import { Chain } from '../model/chain'

import { beraTestnetChain } from './dev-chain'

export const supportChains: Chain[] =
  process.env.BUILD === 'dev'
    ? [
        {
          ...arbitrumSepolia,
          defaultGasPrice: 0n,
          expireIn: 240,
        },
      ]
    : [
        {
          ...beraTestnetChain,
          defaultGasPrice: 0n,
          expireIn: 240,
          icon: '/bera-chain-logo.svg',
        },
      ]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)

export enum CHAIN_IDS {
  ARBITRUM_SEPOLIA = arbitrumSepolia.id,
  BERA_CHAIN_TESTNET = beraTestnetChain.id,
}
