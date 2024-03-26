export type Depth = {
  // TODO: use bigint for bookId
  bookId: string
  unit: bigint
  tick: bigint
  rawAmount: bigint
}

export type MarketDepth = {
  tick: bigint
  price: number
  baseAmount: bigint
}
