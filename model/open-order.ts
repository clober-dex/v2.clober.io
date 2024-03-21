import { Currency } from './currency'

// TODO: remove this
export type OpenOrderV1 = {
  nftId: bigint
  marketAddress: `0x${string}`
  inputToken: Currency
  outputToken: Currency
  isBid: boolean
  priceIndex: number
  orderIndex: bigint
  txHash: `0x${string}`
  txUrl: string
  price: bigint
  baseFilledAmount: bigint
  quoteAmount: bigint
  baseAmount: bigint
  claimableAmount: bigint
}

export type OpenOrder = {
  id: bigint
  bookId: bigint
  inputToken: Currency
  outputToken: Currency
  tick: number
  orderIndex: bigint
  txHash: `0x${string}`
  txUrl: string
  price: bigint
  baseFilledAmount: bigint
  quoteAmount: bigint
  baseAmount: bigint
  claimableAmount: bigint
}
