import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import '../../styles/globals.css'

import { dummyCurrencies } from '../../.storybook/dummy-data/currencies'
import { dummyPrices } from '../../.storybook/dummy-data/prices'

import { SwapForm } from './swap-form'

export default {
  title: 'SwapForm',
  component: SwapForm,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col rounded-2xl bg-gray-900 p-6 w-full sm:w-[480px] lg:h-[480px]">
      <SwapForm {...args} />
    </div>
  ),
} as Meta<typeof SwapForm>

type Story = StoryObj<typeof SwapForm>

export const Default: Story = {
  args: {
    chainId: 1,
    currencies: dummyCurrencies,
    prices: dummyPrices,
    showInputCurrencySelect: false,
    setShowInputCurrencySelect: () => {},
    inputCurrency: undefined,
    setInputCurrency: () => {},
    inputCurrencyAmount: '0.1',
    setInputCurrencyAmount: () => {},
    availableInputCurrencyBalance: 10000000000000000000n,
    showOutputCurrencySelect: false,
    setShowOutputCurrencySelect: () => {},
    outputCurrency: undefined,
    setOutputCurrency: () => {},
    outputCurrencyAmount: '0.1',
    gasEstimateValue: 0.0,
    actionButtonProps: {
      disabled: false,
      onClick: () => {},
      text: 'Swap',
    },
  },
}

export const Selected: Story = {
  args: {
    chainId: 1,
    currencies: dummyCurrencies,
    prices: dummyPrices,
    showInputCurrencySelect: false,
    setShowInputCurrencySelect: () => {},
    inputCurrency: dummyCurrencies[3],
    setInputCurrency: () => {},
    inputCurrencyAmount: '1.123',
    setInputCurrencyAmount: () => {},
    availableInputCurrencyBalance: 10000000000000000000n,
    showOutputCurrencySelect: false,
    setShowOutputCurrencySelect: () => {},
    outputCurrency: dummyCurrencies[5],
    setOutputCurrency: () => {},
    outputCurrencyAmount: '2000',
    slippageInput: '1.00',
    setSlippageInput: () => {},
    gasEstimateValue: 1.12,
    actionButtonProps: {
      disabled: false,
      onClick: () => {},
      text: 'Swap',
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
