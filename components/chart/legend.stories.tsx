import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'
import { Legend } from './legend'

export default {
  title: 'Legend',
  component: Legend,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof Legend>

type Story = StoryObj<typeof Legend>

export const Default: Story = {
  args: {
    data: [
      {
        label: 'v2',
        color: '#4C82FB',
        value: '1632677264.9896278',
      },
      {
        label: 'v3',
        color: '#FC72FF',
        value: '1632677264.9896278',
      },
    ],
  },
}
