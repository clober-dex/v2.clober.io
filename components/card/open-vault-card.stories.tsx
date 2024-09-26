import React from 'react'
import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'

import { PoolPositionCard } from './pool-position-card'

export default {
  title: 'PoolPositionCard',
  component: PoolPositionCard,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col w-[448px] h-[154px] gap-2">
      <PoolPositionCard {...args} />
    </div>
  ),
} as Meta<typeof PoolPositionCard>

type Story = StoryObj<typeof PoolPositionCard>

export const Default: Story = {
  args: {
    poolPosition: {
      pool: {
        key: '0x',
        lpCurrency: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'ETH-USDC-LP',
          symbol: 'ETH-USDC-LP',
          decimals: 18,
        },
        currency0: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        currency1: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        apy: 120.5434,
        tvl: 43123123.0123455,
        volume24h: 123123.123411,
        reserve0: 123123.1234,
        reserve1: 123123.1234,
      },
      amount: 1001234000000000000n,
      value: 123441.3241,
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
