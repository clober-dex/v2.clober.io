import { zeroAddress } from 'viem'

import { Currency } from '../model/currency'

import { CHAIN_IDS } from './chain'

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
      address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: [], // todo
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
