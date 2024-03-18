import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { TICK_WRAPPER_ABI } from '../abis/mock/tick-wrapper-abi'
import { baseToQuote, fromPrice, quoteToBase, toPrice } from '../model/tick'

const MAX_TICK = Math.pow(2, 19) - 1
const MIN_TICK = -1 * MAX_TICK

const MIN_PRICE = 5800731190957938n
const MAX_PRICE =
  19961636804996334433808922353085948875386438476189866322430503n

const randomInteger = (start: number, end: number) => {
  return Math.floor(Math.random() * (end - start + 1) + start)
}
describe('Tick', () => {
  const TICK_WRAPPER_ADDRESS = '0x1A0E22870dE507c140B7C765a04fCCd429B8343F'
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  })

  it('index to price', async () => {
    const randomPriceIndices = [
      MIN_TICK,
      ...Array.from({ length: 500 }, () => randomInteger(-500000, 500000)),
      MAX_TICK,
    ]
    const actualPrices = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'toPrice',
          args: [priceIndex],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)

    const expectedPrices = randomPriceIndices.map((priceIndex) =>
      toPrice(BigInt(priceIndex)),
    )
    expect(expectedPrices).toEqual(actualPrices)
  }, 100000)

  it('price to index', async () => {
    const randomPriceIndices = [
      MIN_TICK,
      ...Array.from({ length: 500 }, () => randomInteger(-500000, 500000)),
      MAX_TICK,
    ]

    const actualPrices = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'toPrice',
          args: [priceIndex],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)

    const actualPriceIndices = (
      (await publicClient.multicall({
        contracts: actualPrices.map((price) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'fromPrice',
          args: [price],
        })),
      })) as { result: number }[]
    ).map(({ result }) => BigInt(result))
    const expectedPriceIndices = actualPrices.map((price) => fromPrice(price))
    expect(expectedPriceIndices).toEqual(actualPriceIndices)
  }, 100000)

  it('price to index for min and max', async () => {
    const actualPrices = [MIN_PRICE, MAX_PRICE]
    const actualPriceIndices = (
      (await publicClient.multicall({
        contracts: actualPrices.map((price) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'fromPrice',
          args: [price],
        })),
      })) as { result: number }[]
    ).map(({ result }) => BigInt(result))
    const expectedPriceIndices = actualPrices.map((price) => fromPrice(price))
    expect(expectedPriceIndices).toEqual(actualPriceIndices)
  })

  it('quote to base', async () => {
    const randomPriceIndices = Array.from({ length: 100 }, () =>
      randomInteger(-100000, 100000),
    )
    const actual = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'quoteToBase',
          args: [priceIndex, 1000000n, true],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)
    const expected = randomPriceIndices.map((priceIndex) =>
      quoteToBase(BigInt(priceIndex), 1000000n, true),
    )
    expect(expected).toEqual(actual)
  })

  it('base to quote', async () => {
    const randomPriceIndices = Array.from({ length: 100 }, () =>
      randomInteger(-100000, 100000),
    )
    const actual = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: TICK_WRAPPER_ADDRESS,
          abi: TICK_WRAPPER_ABI,
          functionName: 'baseToQuote',
          args: [priceIndex, 1000000n, true],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)
    const expected = randomPriceIndices.map((priceIndex) =>
      baseToQuote(BigInt(priceIndex), 1000000n, true),
    )
    expect(expected).toEqual(actual)
  })
})
