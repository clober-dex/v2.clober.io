import { getAddress, zeroAddress } from 'viem'

import { CHAIN_IDS } from './chain'

export const CONTRACT_ADDRESSES: {
  [chain in CHAIN_IDS]: {
    Controller: `0x${string}`
    BookManager: `0x${string}`
  }
} = {
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: {
    Controller: getAddress('0xc895AB5b17069aB411F049Ec4248D5660b588B59'),
    BookManager: getAddress('0x0A3a2c27e4641aB9Ed80369D799Dc1166055048e'),
  },
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    Controller: zeroAddress,
    BookManager: zeroAddress,
  },
}
