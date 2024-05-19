import { Meta, StoryObj } from '@storybook/react'
import {
  arbitrum,
  arbitrumSepolia,
  base,
  fantom,
  mainnet,
  polygon,
  zkSync,
  zkSyncSepoliaTestnet,
} from 'viem/chains'

import { beraTestnetChain } from '../../constants/dev-chain'

import ChainSelector from './chain-selector'

import '../../styles/globals.css'

export default {
  title: 'ChainSelector',
  component: ChainSelector,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof ChainSelector>

type Story = StoryObj<typeof ChainSelector>
export const Default: Story = {
  args: {
    chain: {
      ...arbitrumSepolia,
      defaultGasPrice: 0n,
      expireIn: 0,
    },
    setChain: () => {},
    chains: [
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
    ],
  },
}

export const OnlyMainnet: Story = {
  args: {
    chain: {
      ...mainnet,
      defaultGasPrice: 0n,
      expireIn: 0,
    },
    setChain: () => {},
    chains: [
      {
        ...mainnet,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...polygon,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...arbitrum,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...base,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...fantom,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
    ],
  },
}

export const OnlyTestnet: Story = {
  args: {
    chain: {
      ...zkSyncSepoliaTestnet,
      defaultGasPrice: 0n,
      expireIn: 0,
    },
    setChain: () => {},
    chains: [
      {
        ...arbitrumSepolia,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...zkSyncSepoliaTestnet,
        defaultGasPrice: 0n,
        expireIn: 0,
      },
      {
        ...beraTestnetChain,
        defaultGasPrice: 0n,
        expireIn: 240,
        icon: 'https://img.cryptorank.io/coins/berachain1681996075164.png',
      },
    ],
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
