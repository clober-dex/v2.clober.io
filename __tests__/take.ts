import hre from 'hardhat'
import { createPublicClient, http, zeroAddress, zeroHash } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from '@ethersproject/contracts'
import { ethers } from 'ethers'

import { BOOK_VIEWER_ABI } from '../abis/core/book-viewer'
import { toId } from '../utils/book-id'
import { BookKey } from '../model/book-key'
import { encodeToFeePolicy } from '../utils/fee'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../constants/fee'
import { MAX_TICK, quoteToBase, toPrice } from '../utils/tick'
import { Book } from '../model/book'
import { Depth } from '../model/depth'

describe('Take Logic', () => {
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

    const [admin] = await hre.ethers.getSigners()

    return {
      admin,
      BookViewer: await hre.ethers.getContractAt(
        BOOK_VIEWER_ABI as any,
        '0x56319f390C3B85Fb8eb18B03b8E14440F3a8c66b',
        admin,
      ),
    }
  }

  const checkTakeLogic = async ({
    BookViewer,
    key,
    quoteAmount,
  }: {
    BookViewer: Contract
    key: BookKey
    quoteAmount: bigint
  }) => {
    const actual = await BookViewer.getExpectedInput({
      id: toId(key),
      limitPrice: MAX_TICK,
      quoteAmount,
      hookData: zeroHash,
    })
    const liquidities = await BookViewer.getLiquidity(toId(key), MAX_TICK, 10n)
    const mockBook = new Book({
      base: { address: key.base, name: 'mock', symbol: 'mock', decimals: 18 },
      unit: key.unit,
      quote: { address: key.quote, name: 'mock', symbol: 'mock', decimals: 18 },
      makerPolicy: BigInt(key.makerPolicy),
      hooks: key.hooks,
      takerPolicy: BigInt(key.takerPolicy),
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
              quoteAmount: BigInt(liquidity.depth) * key.unit,
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
      amountIn: quoteAmount,
    })
    expect(actual.takenQuoteAmount.toString()).toEqual(
      expected.takenQuoteAmount.toString(),
    )
    expect(actual.spendBaseAmount.toString()).toEqual(
      expected.spendBaseAmount.toString(),
    )
  }

  it('take bid side', async () => {
    const { BookViewer } = await setUp({ blockNumber: 25020165 })
    const key: BookKey = {
      base: zeroAddress,
      unit: 1n,
      quote: '0x00bfd44e79fb7f6dd5887a9426c8ef85a0cd23e0',
      makerPolicy: encodeToFeePolicy(true, MAKER_DEFAULT_POLICY),
      hooks: zeroAddress,
      takerPolicy: encodeToFeePolicy(true, TAKER_DEFAULT_POLICY),
    }

    await checkTakeLogic({
      BookViewer,
      key,
      quoteAmount: 10000n * 10n ** 6n,
    })
    await checkTakeLogic({
      BookViewer,
      key,
      quoteAmount: 10000000n * 10n ** 6n,
    })
    await checkTakeLogic({
      BookViewer,
      key,
      quoteAmount: 0n * 10n ** 6n,
    })
    await checkTakeLogic({
      BookViewer,
      key,
      quoteAmount: 1n * 10n ** 6n,
    })
    await checkTakeLogic({
      BookViewer,
      key,
      quoteAmount: 1000000000000n * 10n ** 6n,
    })
  }, 100000)
})
