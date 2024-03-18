import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { BOOK_ID_WRAPPER_ABI } from '../abis/mock/book-id-wrapper-abi'
import { toId } from '../utils/book-id'

describe('BookID', () => {
  const BOOK_ID_WRAPPER_ADDRESS = '0x5C91A02B8B5D10597fc6cA23faF56F9718D1feD0'
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  })

  it('check toId function', async () => {
    const bookKey = {
      base: '0x0000000000000000000000000000000000000001' as `0x${string}`,
      unit: 100n,
      quote: '0x0000000000000000000000000000000000000002' as `0x${string}`,
      makerPolicy: 100,
      hooks: '0x0000000000000000000000000000000000000003' as `0x${string}`,
      takerPolicy: 1000,
    }
    const actual = await publicClient.readContract({
      address: BOOK_ID_WRAPPER_ADDRESS,
      abi: BOOK_ID_WRAPPER_ABI,
      functionName: 'toId',
      args: [bookKey],
    })
    const expected = toId(bookKey)
    expect(actual).toBe(expected)
  }, 100000)
})
