import '../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { base } from 'viem/chains'

import Panel from './panel'

export default {
  title: 'Common/Panel',
  component: Panel,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof Panel>

type Story = StoryObj<typeof Panel>
export const Default: Story = {
  args: {
    chainId: base.id,
    open: true,
    setOpen: () => {},
    // @ts-ignore
    router: {
      query: {
        mode: 'borrow',
      },
    },
    selectedMode: 'deposit',
  },
}
