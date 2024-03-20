import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { FEE_POLICY_WRAPPER_ABI } from '../abis/mock/fee-policy-wrapper-abi'
import {
  calculateFee,
  calculateOriginalAmount,
  encodeToFeePolicy,
  getUsesQuote,
} from '../utils/fee'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'

const FEE_POLICY_WRAPPER_ADDRESS = '0xDCFA7E8Ad03D50EdF29e49bEBA7e5ae118B49A62'
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
})

describe('FeePolicy', () => {
  const encode = async (usesQuote: boolean, rate: number) => {
    const policy = await publicClient.readContract({
      address: FEE_POLICY_WRAPPER_ADDRESS,
      abi: FEE_POLICY_WRAPPER_ABI,
      functionName: 'encode',
      args: [usesQuote, rate],
    })
    expect(policy).toEqual(encodeToFeePolicy(usesQuote, BigInt(rate)))
    expect(
      await publicClient.readContract({
        address: FEE_POLICY_WRAPPER_ADDRESS,
        abi: FEE_POLICY_WRAPPER_ABI,
        functionName: 'usesQuote',
        args: [policy],
      }),
    ).toEqual(getUsesQuote(BigInt(policy)))
  }

  const checkCalculateFee = async (
    policy: number,
    amount: bigint,
    reverseRounding: boolean,
  ) => {
    expect(
      await publicClient.readContract({
        address: FEE_POLICY_WRAPPER_ADDRESS,
        abi: FEE_POLICY_WRAPPER_ABI,
        functionName: 'calculateFee',
        args: [policy, amount, reverseRounding],
      }),
    ).toEqual(calculateFee(BigInt(policy), amount, reverseRounding))
  }

  const checkCalculateOriginalAmount = async (
    policy: number,
    amount: bigint,
    reverseFee: boolean,
  ) => {
    expect(
      await publicClient.readContract({
        address: FEE_POLICY_WRAPPER_ADDRESS,
        abi: FEE_POLICY_WRAPPER_ABI,
        functionName: 'calculateOriginalAmount',
        args: [policy, amount, reverseFee],
      }),
    ).toEqual(calculateOriginalAmount(BigInt(policy), amount, reverseFee))
  }

  it('encode', async () => {
    await encode(true, 0)
    await encode(true, 1)
    await encode(true, Number(MAKER_DEFAULT_POLICY))
    await encode(true, Number(TAKER_DEFAULT_POLICY))
    await encode(true, 500000)
    await encode(true, -500000)
    await encode(false, 0)
    await encode(false, 1)
    await encode(false, 500000)
    await encode(false, -500000)
    await encode(false, Number(MAKER_DEFAULT_POLICY))
    await encode(false, Number(TAKER_DEFAULT_POLICY))
  }, 100000)

  it('calculate fee', async () => {
    await checkCalculateFee(encodeToFeePolicy(true, 0n), 1000000n, false)
    await checkCalculateFee(encodeToFeePolicy(true, 1n), 1000000n, false)
    await checkCalculateFee(
      encodeToFeePolicy(true, MAKER_DEFAULT_POLICY),
      1000000n,
      false,
    )
    await checkCalculateFee(
      encodeToFeePolicy(true, TAKER_DEFAULT_POLICY),
      1000000n,
      false,
    )
    await checkCalculateFee(encodeToFeePolicy(true, 500000n), 1000000n, false)
    await checkCalculateFee(encodeToFeePolicy(true, -500000n), 1000000n, false)
  }, 100000)

  it('calculate original amount', async () => {
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, 0n),
      1000000n,
      false,
    )
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, 1n),
      1000000n,
      false,
    )
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, MAKER_DEFAULT_POLICY),
      1000000n,
      false,
    )
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, TAKER_DEFAULT_POLICY),
      1000000n,
      false,
    )
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, 500000n),
      1000000n,
      false,
    )
    await checkCalculateOriginalAmount(
      encodeToFeePolicy(true, -500000n),
      1000000n,
      false,
    )
  }, 100000)
})
