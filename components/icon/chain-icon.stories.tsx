import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { arbitrum, mainnet, polygon } from 'viem/chains'

import ChainIcon from './chain-icon'

import '../../styles/globals.css'

export default {
  title: 'ChainIcon',
  component: ChainIcon,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="relative w-16 h-16">
      <ChainIcon {...args} />
    </div>
  ),
} as Meta<typeof ChainIcon>

type Story = StoryObj<typeof ChainIcon>

export const Ethereum: Story = {
  args: {
    chain: mainnet,
  },
}
export const Polygon: Story = {
  args: {
    chain: polygon,
  },
}

export const Arbitrum: Story = {
  args: {
    chain: arbitrum,
  },
}
