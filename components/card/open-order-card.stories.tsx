import React from 'react'
import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'
import { base } from 'viem/chains'

import { dummyCurrencies } from '../../.storybook/dummy-data/currencies'

import { OpenOrderCard } from './open-order-card'

export default {
  title: 'OpenOrderCard',
  component: OpenOrderCard,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col w-[448px] h-[154px] gap-2">
      <OpenOrderCard {...args} />
    </div>
  ),
} as Meta<typeof OpenOrderCard>

type Story = StoryObj<typeof OpenOrderCard>

export const Bid: Story = {
  args: {
    chainId: base.id,
    openOrder: {
      id: '1',
      isBid: true,
      tick: 1,
      orderIndex: '1',
      user: zeroAddress,
      inputCurrency: dummyCurrencies[0],
      outputCurrency: dummyCurrencies[1],
      txHash:
        '0x6d91975935196522e7da9911412a1c2c2e509b13f19f215f7aaef820f7125734',
      createdAt: 1630000000000,
      price: '1600',
      amount: {
        value: '10000000',
        currency: dummyCurrencies[0],
      },
      filled: {
        value: '9000000',
        currency: dummyCurrencies[0],
      },
      claimed: {
        value: '1000000',
        currency: dummyCurrencies[0],
      },
      claimable: {
        value: '100',
        currency: dummyCurrencies[0],
      },
      cancelable: {
        value: '1000000',
        currency: dummyCurrencies[0],
      },
    },
  },
}

export const Ask: Story = {
  args: {
    chainId: base.id,
    openOrder: {
      id: '1',
      isBid: false,
      tick: 1,
      orderIndex: '1',
      user: zeroAddress,
      inputCurrency: dummyCurrencies[1],
      outputCurrency: dummyCurrencies[0],
      txHash:
        '0x6d91975935196522e7da9911412a1c2c2e509b13f19f215f7aaef820f7125734',
      createdAt: 1630000000000,
      price: '1600',
      amount: {
        value: '10000000',
        currency: dummyCurrencies[0],
      },
      filled: {
        value: '9000000',
        currency: dummyCurrencies[0],
      },
      claimed: {
        value: '1000000',
        currency: dummyCurrencies[0],
      },
      claimable: {
        value: '100',
        currency: dummyCurrencies[0],
      },
      cancelable: {
        value: '1000000',
        currency: dummyCurrencies[0],
      },
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
