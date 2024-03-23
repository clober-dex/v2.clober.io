import { Market } from '../../model/market'
import { Book } from '../../model/book'
import { Depth } from '../../model/depth'
import { fromPrice } from '../../utils/tick'
import { arbitrumSepolia } from 'viem/chains'
import { parsePrice } from '../../utils/prices'
import { zeroAddress } from 'viem'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../../constants/fee'
import { FeePolicy } from '../../model/fee-policy'

export const dummyMarkets: Market[] = [
  new Market({
    chainId: arbitrumSepolia.id,
    tokens: [
      {
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      {
        address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
      },
    ],
    makerPolicy: MAKER_DEFAULT_POLICY,
    hooks: zeroAddress,
    takerPolicy: TAKER_DEFAULT_POLICY,
    latestTick: 0n,
    latestPrice: 0n,
    latestTimestamp: 0,
    books: [
      new Book({
        chainId: arbitrumSepolia.id,
        tokens: [
          {
            address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
          },
          {
            address: '0x0000000000000000000000000000000000000000',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        ],
        unit: 1n,
        makerPolicy: MAKER_DEFAULT_POLICY,
        hooks: '0x0000000000000000000000000000000000000000',
        takerPolicy: TAKER_DEFAULT_POLICY,
        latestTick: 0n,
        latestPrice: 0n,
        depths: [5000, 5000.0001, 5001, 5001.1, 5555, 6000, 6666, 6969].map(
          (price) => {
            const tick = fromPrice(parsePrice(price, 6, 18))
            const rawAmount = 10000n * 10n ** 6n
            return {
              bookId: '0x000000000000000000000000000000000000000a',
              tick,
              price: parsePrice(price, 6, 18),
              rawAmount,
              quoteAmount: rawAmount * 1n,
              baseAmount: 10n ** 18n,
            } as Depth
          },
        ),
      }),
      new Book({
        chainId: arbitrumSepolia.id,
        tokens: [
          {
            address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
          },
          {
            address: '0x0000000000000000000000000000000000000000',
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        ],
        unit: 12n,
        makerPolicy: MAKER_DEFAULT_POLICY,
        hooks: '0x0000000000000000000000000000000000000000',
        takerPolicy: TAKER_DEFAULT_POLICY,
        latestTick: 0n,
        latestPrice: 0n,
        depths: [
          4000, 5000, 5555, 7000, 7000.01, 7000.02, 7001, 7003, 7777, 10000,
          10000.00001, 100000,
        ].map((price) => {
          const tick = fromPrice(parsePrice(price, 18, 6))
          const rawAmount = 10000n * 10n ** 12n
          return {
            bookId: '0x000000000000000000000000000000000000000b',
            tick,
            price: parsePrice(price, 18, 6),
            rawAmount,
            quoteAmount: rawAmount * 10n ** 12n,
            baseAmount: 10n ** 18n,
          } as Depth
        }),
      }),
    ],
  }),
]
