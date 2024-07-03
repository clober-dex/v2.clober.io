import { zeroAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../model/currency'

import { BERACHAIN_TESTNET_WHITELISTED_CURRENCIES } from './currencies/80085'

export const ETH: Currency = {
  address: zeroAddress,
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
}

export const WHITELISTED_CURRENCIES: {
  [chain in CHAIN_IDS]: Currency[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [
    ETH,
    {
      address: '0xF2e615A933825De4B39b497f6e6991418Fb31b78',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  [CHAIN_IDS.BERACHAIN_TESTNET]: BERACHAIN_TESTNET_WHITELISTED_CURRENCIES,
  [CHAIN_IDS.BASE]: [],
  [CHAIN_IDS.ZKSYNC]: [],
}

export const DEFAULT_INPUT_CURRENCY: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    address: '0xF2e615A933825De4B39b497f6e6991418Fb31b78',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  [CHAIN_IDS.BERACHAIN_TESTNET]: ETH,
  [CHAIN_IDS.BASE]: {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    name: 'USD Base Coin',
    symbol: 'USDbC',
    decimals: 6,
  },
  [CHAIN_IDS.ZKSYNC]: ETH,
}

export const DEFAULT_OUTPUT_CURRENCY: {
  [chain in CHAIN_IDS]: Currency
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  [CHAIN_IDS.BERACHAIN_TESTNET]: {
    address: '0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B',
    name: 'Honey',
    symbol: 'HONEY',
    decimals: 18,
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
