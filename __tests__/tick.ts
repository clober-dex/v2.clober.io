import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

import { Tick } from '../model/tick'
import { CONTROLLER_ABI } from '../abis/core/controller-abi'

const MAX_TICK = Math.pow(2, 19) - 1
const MIN_TICK = -1 * MAX_TICK

const MIN_PRICE = 5800731190957938n
const MAX_PRICE =
  19961636804996334433808922353085948875386438476189866322430503n

const randomInteger = (start: number, end: number) => {
  return Math.floor(Math.random() * (end - start + 1) + start)
}
describe('Tick', () => {
  const CONTROLLER_ADDRESS = '0x474fb05A287f4BF3aE6A728FEC5E70967B3A04dC'
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  })
  const tick = new Tick()

  it('index to price', async () => {
    const randomPriceIndices = [
      MIN_TICK,
      ...Array.from({ length: 1000 }, () => randomInteger(-500000, 500000)),
      MAX_TICK,
    ]
    const actualPrices = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: CONTROLLER_ADDRESS,
          abi: CONTROLLER_ABI,
          functionName: 'toPrice',
          args: [priceIndex],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)

    const expectedPrices = randomPriceIndices.map((priceIndex) =>
      tick.toPrice(BigInt(priceIndex)),
    )
    expect(expectedPrices).toEqual(actualPrices)
  }, 10000)

  it('price to index', async () => {
    const randomPriceIndices = [
      MIN_TICK,
      ...Array.from({ length: 1000 }, () => randomInteger(-500000, 500000)),
      MAX_TICK,
    ]

    const actualPrices = (
      (await publicClient.multicall({
        contracts: randomPriceIndices.map((priceIndex) => ({
          address: CONTROLLER_ADDRESS,
          abi: CONTROLLER_ABI,
          functionName: 'toPrice',
          args: [priceIndex],
        })),
      })) as { result: bigint }[]
    ).map(({ result }) => result)

    const actualPriceIndices = (
      (await publicClient.multicall({
        contracts: actualPrices.map((price) => ({
          address: CONTROLLER_ADDRESS,
          abi: CONTROLLER_ABI,
          functionName: 'fromPrice',
          args: [price],
        })),
      })) as { result: number }[]
    ).map(({ result }) => BigInt(result))
    const expectedPriceIndices = actualPrices.map((price) =>
      tick.fromPrice(price),
    )
    expect(expectedPriceIndices).toEqual(actualPriceIndices)
  }, 10000)

  it('price to index for min and max', async () => {
    const actualPrices = [MIN_PRICE, MAX_PRICE]
    const actualPriceIndices = (
      (await publicClient.multicall({
        contracts: actualPrices.map((price) => ({
          address: CONTROLLER_ADDRESS,
          abi: CONTROLLER_ABI,
          functionName: 'fromPrice',
          args: [price],
        })),
      })) as { result: number }[]
    ).map(({ result }) => BigInt(result))
    const expectedPriceIndices = actualPrices.map((price) =>
      tick.fromPrice(price),
    )
    expect(expectedPriceIndices).toEqual(actualPriceIndices)
  })
})
