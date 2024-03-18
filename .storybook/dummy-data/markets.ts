import { Market } from '../../model/market'
import { Book } from '../../model/book'
import { Depth } from '../../model/depth'
import { quoteToBase, toPrice } from '../../model/tick'

const ticks = [
  -524287, -325538, -98510, 479399, -68697, 425140, 35128, 329697, -217553,
  477854, -292458, 405621, 417308, -289305, -484882, 85491, 123516, -71500,
  22075, 61498, 399217, 524287,
].map((x) => BigInt(x))

export const dummyMarkets: Market[] = [
  new Market({
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
    latestPriceIndex: 0n,
    latestPrice: 0n,
    books: [
      new Book({
        base: {
          address: '0x0000000000000000000000000000000000000000',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        quote: {
          address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        unit: 1n,
        makerPolicy: 3000n,
        hooks: '0x0000000000000000000000000000000000000000',
        takerPolicy: 3000n,
        latestTick: 0n,
        latestPrice: 0n,
        depths: ticks.map(
          (tick) =>
            ({
              boolId: '0x000000000000000000000000000000000000000a',
              tick,
              price: toPrice(tick),
              rawAmount: 100000000n,
              quoteAmount: 100000000n,
              baseAmount: quoteToBase(tick, 100000000n, false),
            }) as Depth,
        ),
      }),
      new Book({
        base: {
          address: '0x00BFD44e79FB7f6dd5887A9426c8EF85A0CD23e0',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        quote: {
          address: '0x0000000000000000000000000000000000000000',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        unit: 1n,
        makerPolicy: 3000n,
        hooks: '0x0000000000000000000000000000000000000000',
        takerPolicy: 3000n,
        latestTick: 0n,
        latestPrice: 0n,
        depths: ticks.map(
          (tick) =>
            ({
              boolId: '0x000000000000000000000000000000000000000b',
              tick,
              price: toPrice(tick),
              rawAmount: 100000000n,
              quoteAmount: 100000000n,
              baseAmount: quoteToBase(tick, 100000000n, false),
            }) as Depth,
        ),
      }),
    ],
  }),
]
