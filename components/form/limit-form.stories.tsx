import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import '../../styles/globals.css'

import { dummyCurrencies } from '../../.storybook/dummy-data/currencies'

import { LimitForm } from './limit-form'

export default {
  title: 'LimitForm',
  component: LimitForm,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-full sm:w-[480px] lg:h-[480px]">
      <LimitForm {...args} />
    </div>
  ),
} as Meta<typeof LimitForm>

type Story = StoryObj<typeof LimitForm>

export const Default: Story = {
  args: {
    chainId: 1,
    currencies: dummyCurrencies,
    balances: {},
    prices: {},
    isBid: true,
    setSelectMode: () => {},
    inputCurrency: undefined,
    setInputCurrency: () => {},
    inputCurrencyAmount: '0.1',
    setInputCurrencyAmount: () => {},
    outputCurrency: undefined,
    setOutputCurrency: () => {},
    outputCurrencyAmount: '0.1',
    setOutputCurrencyAmount: () => {},
    swapInputCurrencyAndOutputCurrency: () => {},
  },
}

export const Selected: Story = {
  args: {
    chainId: 1,
    currencies: dummyCurrencies,
    balances: {},
    prices: {},
    isBid: true,
    setSelectMode: () => {},
    inputCurrency: dummyCurrencies[0],
    setInputCurrency: () => {},
    inputCurrencyAmount: '0.1',
    setInputCurrencyAmount: () => {},
    availableInputCurrencyBalance: 10000000000n,
    outputCurrency: dummyCurrencies[4],
    setOutputCurrency: () => {},
    outputCurrencyAmount: '0.1',
    setOutputCurrencyAmount: () => {},
    availableOutputCurrencyBalance: 100000000000000000n,
    swapInputCurrencyAndOutputCurrency: () => {},
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
