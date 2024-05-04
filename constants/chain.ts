import { arbitrumSepolia, base, zkSyncSepoliaTestnet } from 'viem/chains'

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
  },
  {
    ...base,
    defaultGasPrice: 0n,
    expireIn: 240,
  },
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
  BASE = base.id,
  ZKSYNC_SEPOLIA_TESTNET = zkSyncSepoliaTestnet.id,
}
