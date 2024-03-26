import { createPublicClient, http, zeroAddress, zeroHash } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import dotenv from 'dotenv'

import { BOOK_VIEWER_ABI } from '../abis/core/book-viewer'
import { toId } from '../utils/book-id'
import { BookKey } from '../model/book-key'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'
import { MAX_TICK, quoteToBase, toPrice } from '../utils/tick'
import { Book } from '../model/book'
import { Depth } from '../model/depth'

dotenv.config()

const BLOCK_NUMBER = 25020165n
const BOOK_VIEWER_CONTRACT_ADDRESS =
  '0x56319f390C3B85Fb8eb18B03b8E14440F3a8c66b'
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL),
})

describe('Spend Logic', () => {
  const checkSpendLogic = async ({
    blockNumber,
    key,
    baseAmount,
  }: {
    blockNumber: bigint
    key: BookKey
    baseAmount: bigint
  }) => {
    const [takenQuoteAmount, spendBaseAmount] = await publicClient.readContract(
      {
        address: BOOK_VIEWER_CONTRACT_ADDRESS,
        abi: BOOK_VIEWER_ABI,
        functionName: 'getExpectedOutput',
        args: [
          {
            id: toId(key),
            limitPrice: MAX_TICK,
            baseAmount,
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
    const expected = mockBook.spend({
      limitPrice: MAX_TICK,
      amountIn: baseAmount,
    })
    expect(takenQuoteAmount.toString()).toEqual(
      expected.takenQuoteAmount.toString(),
    )
    expect(spendBaseAmount.toString()).toEqual(
      expected.spendBaseAmount.toString(),
    )
  }

  it('spend bid side', async () => {
    const key: BookKey = {
      base: zeroAddress,
      unit: 1n,
      quote: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 10n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 0n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 5n * 10n ** 17n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1234n * 10n ** 14n,
    })
  }, 100000)

  it('spend ask side', async () => {
    const key: BookKey = {
      quote: zeroAddress,
      unit: 10n ** 12n,
      base: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 10n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 0n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 5n * 10n ** 17n,
    })
    await checkSpendLogic({
      blockNumber: BLOCK_NUMBER,
      key,
      baseAmount: 1234n * 10n ** 14n,
    })
  }, 100000)
})
