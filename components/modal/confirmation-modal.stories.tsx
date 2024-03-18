import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'

import ConfirmationModal from './confirmation-modal'

export default {
  title: 'Modal/ConfirmationModal',
  component: ConfirmationModal,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="w-[288px]">
      <ConfirmationModal {...args} />
    </div>
  ),
} as Meta<typeof ConfirmationModal>

type Story = StoryObj<typeof ConfirmationModal>

export const Default: Story = {
  args: {
    confirmation: {
      title: 'Confirm',
      body: 'Are you sure you want to do this?',
      fields: [
        {
          currency: {
            address: '0x0000000000000000000000000000000000000003',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          label: 'Field 1',
          value: 'Value 1',
        },
        {
          currency: {
            address: '0x0000000000000000000000000000000000000003',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          label: 'Field 1',
          value: 'Value 1',
        },
      ],
    },
  },
}

export const DefaultWithDirection: Story = {
  args: {
    confirmation: {
      title: 'Confirm',
      body: 'Are you sure you want to do this?',
      fields: [
        {
          direction: 'in',
          currency: {
            address: '0x0000000000000000000000000000000000000003',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          label: 'Field 1',
          value: 'Value 1',
        },
        {
          direction: 'out',
          currency: {
            address: '0x0000000000000000000000000000000000000003',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          label: 'Field 1',
          value: 'Value 1',
        },
      ],
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
