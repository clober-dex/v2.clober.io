import {
  arbitrumSepolia,
  base,
  zkSync,
  zkSyncSepoliaTestnet,
} from 'viem/chains'

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
  {
    ...zkSyncSepoliaTestnet,
    defaultGasPrice: 0n,
    expireIn: 240,
  },
]

export const testnetChainIds = [
  arbitrumSepolia.id,
  zkSyncSepoliaTestnet.id,
  beraTestnetChain.id,
]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)

export enum CHAIN_IDS {
  ARBITRUM_SEPOLIA = arbitrumSepolia.id,
  BERA_CHAIN_TESTNET = beraTestnetChain.id,
  BASE = base.id,
  ZKSYNC = zkSync.id,
  ZKSYNC_SEPOLIA_TESTNET = zkSyncSepoliaTestnet.id,
}
