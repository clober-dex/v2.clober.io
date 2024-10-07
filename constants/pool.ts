import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

export const START_LP_PRICE: {
  [chain in CHAIN_IDS]: number
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: 1.6258564735708645,
  [CHAIN_IDS.BERACHAIN_TESTNET]: 0,
  [CHAIN_IDS.BASE]: 0,
  [CHAIN_IDS.ZKSYNC]: 0,
}

export const POOL_KEY_INFOS: {
  [chain in CHAIN_IDS]: {
    token0: `0x${string}`
    token1: `0x${string}`
    salt: `0x${string}`
    key: `0x${string}`
  }[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [
    {
      token0: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
      token1: '0xF2e615A933825De4B39b497f6e6991418Fb31b78',
      salt: zeroHash,
      key: '0xd79f958efd15e4d4c0c0b6fb671a8d220aa18714fc13615e9c3b2b37ea933f64',
    },
  ],
  [CHAIN_IDS.BERACHAIN_TESTNET]: [],
  [CHAIN_IDS.BASE]: [],
  [CHAIN_IDS.ZKSYNC]: [],
}
