import { Meta, StoryObj } from '@storybook/react'

import '../styles/globals.css'

import OrderBook from './order-book'
export default {
  title: 'OrderBook',
  component: OrderBook,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof OrderBook>

type Story = StoryObj<typeof OrderBook>

export const Default: Story = {
  args: {
    name: 'OrderBook',
    bids: [
      { price: '0.000001', tick: 1, size: '12' },
      { price: '0.000002', tick: 1, size: '12' },
      { price: '0.000003', tick: 1, size: '12' },
      { price: '0.000004', tick: 1, size: '12' },
      { price: '0.000005', tick: 1, size: '1' },
    ],
    asks: [
      { price: '0.000006', tick: 1, size: '12' },
      { price: '0.000007', tick: 1, size: '12' },
      { price: '0.000008', tick: 1, size: '12' },
      { price: '0.000009', tick: 1, size: '12' },
      { price: '0.000010', tick: 1, size: '1' },
    ],
    availableDecimalPlacesGroups: [
      { label: '0.000001', value: 6 },
      { label: '0.00001', value: 5 },
      { label: '0.0001', value: 4 },
      { label: '0.001', value: 3 },
    ],
    selectedDecimalPlaces: { label: '0.00001', value: 5 },
    setSelectedDecimalPlaces: () => {},
    setDepthClickedIndex: () => {},
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
