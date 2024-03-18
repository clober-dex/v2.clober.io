import { zeroAddress } from 'viem'

import { CHAIN_IDS } from './chain'

export const CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]: {
    Controller: `0x${string}`
  }
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    Controller: '0xbc563509631f516f5fD487B5C8E15043fAb4273f' as `0x${string}`,
  },
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    Controller: zeroAddress,
  },
}
