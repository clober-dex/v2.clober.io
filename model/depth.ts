export type Depth = {
  // TODO: use bigint for bookId
  bookId: string
  tick: bigint
  price: bigint
  rawAmount: bigint
  baseAmount: bigint
}

export type MergedDepth = {
  tick: bigint
  price: bigint
  baseAmount: bigint
}
