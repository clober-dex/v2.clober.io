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
      { price: '0.000001', rawPrice: '0.000001', size: '12' },
      { price: '0.000002', rawPrice: '0.000002', size: '12' },
      { price: '0.000003', rawPrice: '0.000003', size: '12' },
      { price: '0.000004', rawPrice: '0.000004', size: '12' },
      { price: '0.000005', rawPrice: '0.000005', size: '1' },
    ],
    asks: [
      { price: '0.000006', rawPrice: '0.000006', size: '12' },
      { price: '0.000007', rawPrice: '0.000007', size: '12' },
      { price: '0.000008', rawPrice: '0.000008', size: '12' },
      { price: '0.000009', rawPrice: '0.000009', size: '12' },
      { price: '0.000010', rawPrice: '0.000010', size: '1' },
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
