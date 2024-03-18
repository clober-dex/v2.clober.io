export type BookKey = {
  base: `0x${string}`
  unit: bigint
  quote: `0x${string}`
  makerPolicy: number
  hooks: `0x${string}`
  takerPolicy: number
}
