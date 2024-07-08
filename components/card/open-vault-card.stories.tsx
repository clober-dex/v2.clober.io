import React from 'react'
import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'

import { dummyCurrencies } from '../../.storybook/dummy-data/currencies'

import { OpenVaultCard } from './open-vault-card'

export default {
  title: 'OpenVaultCard',
  component: OpenVaultCard,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col w-[448px] h-[154px] gap-2">
      <OpenVaultCard {...args} />
    </div>
  ),
} as Meta<typeof OpenVaultCard>

type Story = StoryObj<typeof OpenVaultCard>

export const Default: Story = {
  args: {
    openVault: {
      vault: {
        lp: {
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
      },
      lpAmount: 1001234000000000000n,
      lpValue: 123441.3241,
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
