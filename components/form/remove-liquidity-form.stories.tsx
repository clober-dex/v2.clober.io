import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'
import { RemoveLiquidityForm } from './remove-liquidity-form'

export default {
  title: 'RemoveLiquidityForm',
  component: RemoveLiquidityForm,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col rounded-2xl bg-gray-900 p-6 gap-6 md:gap-8 w-full sm:w-[480px] lg:h-[480px]">
      <RemoveLiquidityForm {...args} />
    </div>
  ),
} as Meta<typeof RemoveLiquidityForm>

type Story = StoryObj<typeof RemoveLiquidityForm>

export const Default: Story = {
  args: {
    pool: {
      lpCurrency: {
        address: '0x0000000000000000000000000000000000000001',
        name: 'ETH-USDC-LP',
        symbol: 'ETH-USDC-LP',
        decimals: 18,
      },
      currency0: {
        address: '0x0000000000000000000000000000000000000002',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      currency1: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
      },
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    },
    prices: {
      '0x0000000000000000000000000000000000000001': 50000,
      '0x0000000000000000000000000000000000000002': 50000,
      '0x0000000000000000000000000000000000000003': 0.99999,
    },
    lpCurrencyAmount: '1',
    setLpCurrencyAmount: () => {},
    availableLpCurrencyBalance: 1000999999999999900n,
    removeLiquidityType: 'mixed',
    setRemoveLiquidityType: () => {},
    receiveCurrencies: [
      {
        currency: {
          address: '0x0000000000000000000000000000000000000002',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        amount: 500499999999999950n,
      },
      {
        currency: {
          address: '0x0000000000000000000000000000000000000002',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        amount: 500499999999999950n,
      },
    ],
    actionButtonProps: {
      disabled: false,
      onClick: () => {},
      text: 'Remove Liquidity',
    },
  },
}

export const One: Story = {
  args: {
    pool: {
      lpCurrency: {
        address: '0x0000000000000000000000000000000000000001',
        name: 'ETH-USDC-LP',
        symbol: 'ETH-USDC-LP',
        decimals: 18,
      },
      currency0: {
        address: '0x0000000000000000000000000000000000000002',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      currency1: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
      },
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    },
    prices: {
      '0x0000000000000000000000000000000000000001': 50000,
      '0x0000000000000000000000000000000000000002': 50000,
      '0x0000000000000000000000000000000000000003': 0.99999,
    },
    lpCurrencyAmount: '1',
    setLpCurrencyAmount: () => {},
    availableLpCurrencyBalance: 1000999999999999900n,
    removeLiquidityType: 'mixed',
    setRemoveLiquidityType: () => {},
    receiveCurrencies: [
      {
        currency: {
          address: '0x0000000000000000000000000000000000000002',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        amount: 500499999999999950n,
      },
    ],
    actionButtonProps: {
      disabled: false,
      onClick: () => {},
      text: 'Remove Liquidity',
    },
  },
}

export const Zero: Story = {
  args: {
    pool: {
      lpCurrency: {
        address: '0x0000000000000000000000000000000000000001',
        name: 'ETH-USDC-LP',
        symbol: 'ETH-USDC-LP',
        decimals: 18,
      },
      currency0: {
        address: '0x0000000000000000000000000000000000000002',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      currency1: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
      },
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    },
    prices: {
      '0x0000000000000000000000000000000000000001': 50000,
      '0x0000000000000000000000000000000000000002': 50000,
      '0x0000000000000000000000000000000000000003': 0.99999,
    },
    lpCurrencyAmount: '1',
    setLpCurrencyAmount: () => {},
    availableLpCurrencyBalance: 1000999999999999900n,
    removeLiquidityType: 'mixed',
    setRemoveLiquidityType: () => {},
    receiveCurrencies: [],
    actionButtonProps: {
      disabled: false,
      onClick: () => {},
      text: 'Remove Liquidity',
    },
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
