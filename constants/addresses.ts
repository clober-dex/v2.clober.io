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
    BookManager: getAddress('0x6563188ADfBa863B42B50d010ed0fCD09fBDcD59'),
  },
  [CHAIN_IDS.BERA_CHAIN_TESTNET]: {
    Controller: zeroAddress,
    BookManager: zeroAddress,
  },
}
