import { calculatePoolApy } from '../utils/pool-apy'

const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000)
const todayTimestampInSeconds =
  currentTimestampInSeconds - (currentTimestampInSeconds % (24 * 60 * 60))

describe('Pool Apy', () => {
  it('Pool created after 30d', () => {
    const data = Array.from({ length: 33 }, (_, i) => {
      return {
        timestamp: todayTimestampInSeconds - i * 24 * 60 * 60,
        price: (2377 + i).toString(),
        volume: '93.479556487073258738',
        liquidityA: '7610',
        liquidityB: '2.01',
        totalSupply: '7614',
      }
    })
    const apy = calculatePoolApy(
      data.map(({ timestamp, price }) => ({
        timestamp: Number(timestamp),
        price: Number(price),
      })),
    )
    expect(apy).toBeCloseTo(-14.152178401838345)
  })

  it('Pool created before 30d', () => {
    const data = Array.from({ length: 29 }, (_, i) => {
      return {
        timestamp: todayTimestampInSeconds - i * 24 * 60 * 60,
        price: (2377 + i).toString(),
        volume: '93.479556487073258738',
        liquidityA: '7610',
        liquidityB: '2.01',
        totalSupply: '7614',
      }
    })
    const apy = calculatePoolApy(
      data.map(({ timestamp, price }) => ({
        timestamp: Number(timestamp),
        price: Number(price),
      })),
    )
    expect(apy).toBeCloseTo(-13.279542093129226)
  })
})
