import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import '../styles/globals.css'
import Footer from './footer'
export default {
  title: 'Footer',
  component: Footer,
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <div className="flex flex-col w-[100vw] min-h-[100vh] bg-gray-950">
      <Footer latestSubgraphBlockNumber={1234} />
    </div>
  ),
} as Meta<typeof Footer>

type Story = StoryObj<typeof Footer>

export const Default: Story = {
  args: {},
}
