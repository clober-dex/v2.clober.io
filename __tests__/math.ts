import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { LOG_WRAPPER_ABI } from '../abis/mock/log-wrapper-abi'
import { log2, mostSignificantBit } from '../model/tick'

describe('Math', () => {
  const LOG_WRAPPER_ADDRESS = '0x9C6C405cbB2c1DC7aAAa65156744fC00efc7EC82'
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  })

  it('msb', async () => {
    const numbers = [
      2381976568446569181490681217024n,
      1n,
      1231231234n,
      45674567n,
    ]
    const actuls = (
      (await publicClient.multicall({
        contracts: numbers.map((value) => ({
          address: LOG_WRAPPER_ADDRESS,
          abi: LOG_WRAPPER_ABI,
          functionName: 'mostSignificantBit',
          args: [value],
        })),
      })) as { result: number }[]
    ).map(({ result }) => BigInt(result))
    const expected = numbers.map((value) => mostSignificantBit(value))
    expect(actuls).toEqual(expected)
  }, 100000)

  it('log2', async () => {
    const numbers = [
      2381976568446569181490681217024n,
      1n,
      1231231234n,
      45674567n,
      100n,
    ]
    const actuls = (
      (await publicClient.multicall({
        contracts: numbers.map((value) => ({
          address: LOG_WRAPPER_ADDRESS,
          abi: LOG_WRAPPER_ABI,
          functionName: 'log2',
          args: [value],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)
    const expected = numbers.map((value) => log2(value))
    expect(actuls).toEqual(expected)
  }, 100000)
})
