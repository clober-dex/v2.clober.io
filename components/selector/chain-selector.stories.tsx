import { Meta, StoryObj } from '@storybook/react'
import {
  arbitrum,
  arbitrumSepolia,
  base,
  fantom,
  mainnet,
  polygon,
  zkSync,
} from 'viem/chains'

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
    chain: arbitrumSepolia,
    setChain: () => {},
    chains: [arbitrumSepolia, base, zkSync],
  },
}

export const OnlyMainnet: Story = {
  args: {
    chain: mainnet,
    setChain: () => {},
    chains: [mainnet, polygon, arbitrum, base, fantom],
  },
}

export const OnlyTestnet: Story = {
  args: {
    chain: arbitrumSepolia,
    setChain: () => {},
    chains: [arbitrumSepolia],
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
