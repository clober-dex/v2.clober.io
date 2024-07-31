import { CHAIN_IDS } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

export const POOL_KEY_INFOS: {
  [chain in CHAIN_IDS]: {
    token0: `0x${string}`
    token1: `0x${string}`
    salt: `0x${string}`
  }[]
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: [
    {
      token0: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
      token1: '0xF2e615A933825De4B39b497f6e6991418Fb31b78',
      salt: zeroHash,
    },
  ],
  [CHAIN_IDS.BERACHAIN_TESTNET]: [],
  [CHAIN_IDS.BASE]: [],
  [CHAIN_IDS.ZKSYNC]: [],
}
