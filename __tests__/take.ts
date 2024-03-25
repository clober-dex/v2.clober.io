import { createPublicClient, http, zeroAddress, zeroHash } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { BOOK_VIEWER_ABI } from '../abis/core/book-viewer'
import { toId } from '../utils/book-id'
import { BookKey } from '../model/book-key'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'
import { MAX_TICK, quoteToBase, toPrice } from '../utils/tick'
import { Book } from '../model/book'
import { Depth } from '../model/depth'

const BLOCK_NUMBER = 25020165n
const BOOK_VIEWER_CONTRACT_ADDRESS =
  '0x56319f390C3B85Fb8eb18B03b8E14440F3a8c66b'
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL),
})

describe('Take Logic', () => {
  const checkTakeLogic = async ({
    blockNumber,
    key,
    quoteAmount,
  }: {
    blockNumber: bigint
    key: BookKey
    quoteAmount: bigint
  }) => {
    const [takenQuoteAmount, spendBaseAmount] = await publicClient.readContract(
      {
        address: BOOK_VIEWER_CONTRACT_ADDRESS,
        abi: BOOK_VIEWER_ABI,
        functionName: 'getExpectedInput',
        args: [
          {
            id: toId(key),
            limitPrice: MAX_TICK,
            quoteAmount,
            hookData: zeroHash,
          },
        ],
        blockNumber,
      },
    )
    const liquidities = await publicClient.readContract({
      address: BOOK_VIEWER_CONTRACT_ADDRESS,
      abi: BOOK_VIEWER_ABI,
      functionName: 'getLiquidity',
      args: [toId(key), Number(MAX_TICK), 10n],
      blockNumber,
    })
    const mockBook = new Book({
      id: 0n,
      base: { address: key.base, name: 'mock', symbol: 'mock', decimals: 18 },
      quote: { address: key.quote, name: 'mock', symbol: 'mock', decimals: 18 },
      unit: key.unit,
      makerPolicy: key.makerPolicy,
      hooks: key.hooks,
      takerPolicy: key.takerPolicy,
      latestTick: 0n,
      latestPrice: 0n,
      depths: liquidities
        .filter((liquidity: any) => BigInt(liquidity.depth) > 0n)
        .map(
          (liquidity: any) =>
            ({
              bookId: zeroAddress,
              tick: BigInt(liquidity.tick),
              price: toPrice(BigInt(liquidity.tick)),
              rawAmount: BigInt(liquidity.depth),
              baseAmount: quoteToBase(
                BigInt(liquidity.tick),
                BigInt(liquidity.depth) * key.unit,
                true,
              ),
            }) as Depth,
        ),
    })
    const expected = mockBook.take({
      limitPrice: MAX_TICK,
      amountOut: quoteAmount,
    })
    expect(takenQuoteAmount.toString()).toEqual(
      expected.takenQuoteAmount.toString(),
    )
    expect(spendBaseAmount.toString()).toEqual(
      expected.spendBaseAmount.toString(),
    )
  }

  it('take bid side', async () => {
    const key: BookKey = {
      base: zeroAddress,
      unit: 1n,
      quote: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 10000n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 10000000n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 0n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 1n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 1000000000000n * 10n ** 6n,
    })
  }, 100000)

  it('take ask side', async () => {
    const key: BookKey = {
      quote: zeroAddress,
      unit: 10n ** 12n,
      base: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 10000n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 10000000n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 0n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 1n * 10n ** 6n,
    })
    await checkTakeLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      quoteAmount: 1000000000000n * 10n ** 6n,
    })
  }, 100000)
})
