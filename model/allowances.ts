// contract address => token address => allowance
export type Allowances = {
  [key in `0x${string}`]: { [key in `0x${string}`]: bigint }
}
