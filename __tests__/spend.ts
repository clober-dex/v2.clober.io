import hre from 'hardhat'
import { zeroAddress, zeroHash } from 'viem'
import { Contract } from '@ethersproject/contracts'

import { BOOK_VIEWER_ABI } from '../abis/core/book-viewer'
import { toId } from '../utils/book-id'
import { BookKey } from '../model/book-key'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'
import { MAX_TICK, quoteToBase, toPrice } from '../utils/tick'
import { Book } from '../model/book'
import { Depth } from '../model/depth'

describe('Spend Logic', () => {
  const setUp = async ({ blockNumber }: { blockNumber: number }) => {
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: 'https://arbitrum-sepolia-archive.allthatnode.com',
            blockNumber,
          },
        },
      ],
    })
    hre.network.provider.emit('hardhatNetworkReset')

    const [admin] = await (hre as any).ethers.getSigners()

    return {
      admin,
      BookViewer: await (hre as any).ethers.getContractAt(
        BOOK_VIEWER_ABI as any,
        '0x56319f390C3B85Fb8eb18B03b8E14440F3a8c66b',
        admin,
      ),
    }
  }

  const checkSpendLogic = async ({
    BookViewer,
    key,
    baseAmount,
  }: {
    BookViewer: Contract
    key: BookKey
    baseAmount: bigint
  }) => {
    const actual = await BookViewer.getExpectedOutput({
      id: toId(key),
      limitPrice: MAX_TICK,
      baseAmount,
      hookData: zeroHash,
    })
    const liquidities = await BookViewer.getLiquidity(toId(key), MAX_TICK, 10n)
    const mockBook = new Book({
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
    expect(actual.takenQuoteAmount.toString()).toEqual(
      expected.takenQuoteAmount.toString(),
    )
    expect(actual.spendBaseAmount.toString()).toEqual(
      expected.spendBaseAmount.toString(),
    )
  }

  it('spend bid side', async () => {
    const { BookViewer } = await setUp({ blockNumber: 25020165 })
    const key: BookKey = {
      base: zeroAddress,
      unit: 1n,
      quote: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 10n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 0n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 5n * 10n ** 17n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1234n * 10n ** 14n,
    })
  }, 100000)

  it('spend ask side', async () => {
    const { BookViewer } = await setUp({ blockNumber: 25036851 })
    const key: BookKey = {
      quote: zeroAddress,
      unit: 10n ** 12n,
      base: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: MAKER_DEFAULT_POLICY,
      hooks: zeroAddress,
      takerPolicy: TAKER_DEFAULT_POLICY,
    }

    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 10n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 0n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1n * 10n ** 18n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 5n * 10n ** 17n,
    })
    await checkSpendLogic({
      BookViewer,
      key,
      baseAmount: 1234n * 10n ** 14n,
    })
  }, 100000)
})
