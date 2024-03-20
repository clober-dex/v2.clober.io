import { FeePolicy } from './fee-policy'

export type BookKey = {
  base: `0x${string}`
  unit: bigint
  quote: `0x${string}`
  makerPolicy: FeePolicy
  hooks: `0x${string}`
  takerPolicy: FeePolicy
}
