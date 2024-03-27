import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import '../../styles/globals.css'

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
    openOrder: {
      id: 1n,
      bookId: 1n,
      tick: 1n,
      inputToken: dummyCurrencies[0],
      outputToken: dummyCurrencies[1],
      isBid: true,
      txHash:
        '0x6d91975935196522e7da9911412a1c2c2e509b13f19f215f7aaef820f7125734',
      txUrl: '',
      orderIndex: 1n,
      quoteAmount: 100000000n,
      price: 1600000000000000000000n,
      baseFilledAmount: 120000000000000000n,
      baseAmount: 1000000000000000000n,
      claimableAmount: 700000000000000000n,
      cancelable: true,
    },
  },
}

export const Ask: Story = {
  args: {
    openOrder: {
      id: 1n,
      bookId: 1n,
      tick: 1n,
      inputToken: dummyCurrencies[1],
      outputToken: dummyCurrencies[0],
      isBid: false,
      txHash:
        '0x6d91975935196522e7da9911412a1c2c2e509b13f19f215f7aaef820f7125734',
      txUrl: '',
      orderIndex: 1n,
      quoteAmount: 100000000n,
      price: 1600000000000000000000n,
      baseFilledAmount: 1000000000000000000n,
      baseAmount: 1000000000000000000n,
      claimableAmount: 1000000000000000000n,
      cancelable: true,
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
