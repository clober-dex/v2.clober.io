export type BookKey = {
  base: `0x${string}`
  unit: bigint
  quote: `0x${string}`
  makerPolicy: bigint
  hooks: `0x${string}`
  takerPolicy: bigint
}
