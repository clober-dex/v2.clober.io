import { Currency } from './currency'

export type OpenOrder = {
  id: bigint
  isBid: boolean
  bookId: bigint
  inputToken: Currency
  outputToken: Currency
  tick: bigint
  orderIndex: bigint
  txHash: `0x${string}`
  txUrl: string
  price: bigint
  baseFilledAmount: bigint
  quoteAmount: bigint
  baseAmount: bigint
  claimableAmount: bigint
}
