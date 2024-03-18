import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'
import { dummyMarketV1s } from '../../.storybook/dummy-data/market-v1'

import MarketSelect from './market-select'

export default {
  title: 'MarketSelector',
  component: MarketSelect,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof MarketSelect>

type Story = StoryObj<typeof MarketSelect>
export const Default: Story = {
  args: {
    markets: dummyMarketV1s,
    onBack: () => {},
    onMarketSelect: () => {},
  },
}

export const Empty: Story = {
  args: {
    markets: [],
    onBack: () => {},
    onMarketSelect: () => {},
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
