import { zeroAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../model/currency'

import { MITOSIS_WHITELISTED_CURRENCIES } from './currencies/mitosis'

export const ETH: Currency = {
  address: zeroAddress,
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
}

export const WHITELISTED_CURRENCIES: {
  [chain in CHAIN_IDS]: Currency[]
} = {
  [CHAIN_IDS.CLOBER_TESTNET]: [],
  [CHAIN_IDS.CLOBER_TESTNET_2]: [],
  [CHAIN_IDS.BERACHAIN_TESTNET]: [],
  [CHAIN_IDS.BASE]: [
    {
      address: '0x67f0870BB897F5E1c369976b4A2962d527B9562c',
      name: 'Department Of Government Efficiency',
      symbol: 'DOGE',
      decimals: 18,
    },
  ],
  [CHAIN_IDS.ZKSYNC]: [],
  [CHAIN_IDS.MITOSIS_TESTNET]: MITOSIS_WHITELISTED_CURRENCIES,
}

export const DEFAULT_INPUT_CURRENCY: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.CLOBER_TESTNET]: ETH,
  [CHAIN_IDS.CLOBER_TESTNET_2]: ETH,
  [CHAIN_IDS.BERACHAIN_TESTNET]: ETH,
  [CHAIN_IDS.MITOSIS_TESTNET]: {
    address: zeroAddress,
    name: 'Mitosis Token',
    symbol: 'MITO',
    decimals: 18,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
  },
  [CHAIN_IDS.BASE]: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  [CHAIN_IDS.ZKSYNC]: ETH,
}

export const DEFAULT_OUTPUT_CURRENCY: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.CLOBER_TESTNET]: ETH,
  [CHAIN_IDS.CLOBER_TESTNET_2]: ETH,
  [CHAIN_IDS.BERACHAIN_TESTNET]: ETH,
  [CHAIN_IDS.MITOSIS_TESTNET]: {
    address: '0xCB0CedF61be0Bf4d5F6596b8ab296614b154db91',
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
  },
  [CHAIN_IDS.BASE]: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  [CHAIN_IDS.ZKSYNC]: {
    address: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
}
