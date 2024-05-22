import { zeroAddress } from 'viem'
import { CHAIN_IDS } from '@clober/v2-sdk'

import { Currency } from '../model/currency'

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
  [CHAIN_IDS.BERACHAIN_TESTNET]: [
    {
      address: zeroAddress,
      name: 'BERA',
      symbol: 'BERA',
      decimals: 18,
    },
    {
      address: '0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B',
      name: 'Honey',
      symbol: 'HONEY',
      decimals: 18,
    },
    {
      address: '0x7588AFc469d95300C2206Bf8a6Ee9bf5d2719314',
      name: 'MockUSDT',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      address: '0x7d06c636bA86BD1fc2C38B11F1e5701145CABc30',
      name: 'MockToken',
      symbol: 'TEST',
      decimals: 18,
    },
  ],
  [CHAIN_IDS.BASE]: [
    ETH,
    {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      name: 'USD Base Coin',
      symbol: 'USDbC',
      decimals: 6,
    },
  ],
  [CHAIN_IDS.ZKSYNC]: [
    ETH,
    {
      address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
    {
      address: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  [CHAIN_IDS.ZKSYNC_SEPOLIA]: [
    {
      address: '0x1d32dcf2d957c9973a00d53641aeeb8d671df865',
      name: 'MockToken',
      symbol: 'TEST',
      decimals: 18,
    },
    {
      address: '0xe6b14f66a3ad92edd45960afd1d932fbb7f92d21',
      name: 'MockUSDT',
      symbol: 'USDT',
      decimals: 6,
    },
  ],
}
