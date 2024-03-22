import { getAddress, zeroAddress } from 'viem'

import { CHAIN_IDS } from './chain'

export const CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]: {
    Controller: `0x${string}`
    BookManager: `0x${string}`
  }
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    Controller: getAddress('0xcD79DE6Ee6644A225A87D2F40D3E3DeA8f9F7B39'),
    BookManager: getAddress('0xe10D92B75Bdb0925f3ABAa2c3E0f93f4ef4b2491'),
  },
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    Controller: zeroAddress,
    BookManager: zeroAddress,
  },
}
