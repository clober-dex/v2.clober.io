import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'
import InspectCurrencyModal from './inspect-currency-modal'

export default {
  title: 'Modal/InspectCurrencyModal',
  component: InspectCurrencyModal,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof InspectCurrencyModal>

type Story = StoryObj<typeof InspectCurrencyModal>

export const Default: Story = {
  args: {
    currency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    onCurrencySelect: () => {},
    setInspectingCurrency: () => {},
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
