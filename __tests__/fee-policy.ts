import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { FEE_POLICY_WRAPPER_ABI } from '../abis/mock/fee-policy-wrapper-abi'
import { encodeToFeePolicy, getUsesQuote } from '../utils/fee'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'

const FEE_POLICY_WRAPPER_ADDRESS = '0xeCf364e0E157BF23A0d0FcF787ee35665C792dB5'
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
    ).toEqual(getUsesQuote(policy))
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
})
