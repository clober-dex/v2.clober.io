import { arbitrumSepolia, zkSyncSepoliaTestnet } from 'viem/chains'

import { Chain } from '../model/chain'

import { beraTestnetChain } from './dev-chain'

export const supportChains: Chain[] =
  process.env.BUILD === 'dev'
    ? [
        {
          ...zkSyncSepoliaTestnet,
          defaultGasPrice: 0n,
          expireIn: 240,
        },
      ]
    : [
        {
          ...zkSyncSepoliaTestnet,
          defaultGasPrice: 0n,
          expireIn: 240,
        },
      ]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)

export enum CHAIN_IDS {
  ARBITRUM_SEPOLIA = arbitrumSepolia.id,
  BERA_CHAIN_TESTNET = beraTestnetChain.id,
  ZKSYNC_SEPOLIA = zkSyncSepoliaTestnet.id,
}
