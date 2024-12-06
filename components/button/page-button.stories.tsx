import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'
import { LimitPageSvg } from '../svg/limit-page-svg'

import { PageButton } from './page-button'

export default {
  title: 'PageButton',
  component: PageButton,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <>
      <PageButton {...args} />
    </>
  ),
} as Meta<typeof PageButton>

type Story = StoryObj<typeof PageButton>

export const Default: Story = {
  args: {
    onClick: () => {},
    disabled: false,
    children: <LimitPageSvg className="w-4 h-4" />,
  },
}

export const Disabled: Story = {
  args: {
    onClick: () => {},
    disabled: true,
    children: <LimitPageSvg className="w-4 h-4" />,
  },
}
