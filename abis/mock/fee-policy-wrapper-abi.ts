export const FEE_POLICY_WRAPPER_ABI = [
  {
    inputs: [],
    name: 'InvalidFeePolicy',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'usesQuote_',
        type: 'bool',
      },
      {
        internalType: 'int24',
        name: 'rate_',
        type: 'int24',
      },
    ],
    name: 'encode',
    outputs: [
      {
        internalType: 'FeePolicy',
        name: 'feePolicy',
        type: 'uint24',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const
