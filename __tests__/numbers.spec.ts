import { findFirstNonZeroIndex, toPlacesString } from '../utils/bignumber'

describe('Numbers', () => {
  it('findFirstNonZeroIndex', () => {
    expect(findFirstNonZeroIndex(1111.1023123)).toBe(1)
    expect(findFirstNonZeroIndex(0.1023123)).toBe(1)
    expect(findFirstNonZeroIndex(0.01023123)).toBe(2)
    expect(findFirstNonZeroIndex(0)).toBe(0)
    expect(findFirstNonZeroIndex(1000000)).toBe(0)
    expect(findFirstNonZeroIndex(123)).toBe(0)
    expect(findFirstNonZeroIndex(123.000000123)).toBe(7)
  })

  it('toPlacesString', () => {
    expect(toPlacesString(1111.1023123)).toBe('1111.1023')
    expect(toPlacesString(0.00000000001023123)).toBe('0.00000000001')
    expect(toPlacesString(1110.000001023123)).toBe('1110.0000')
    expect(toPlacesString(0.1023123)).toBe('0.1023')
    expect(toPlacesString(0.01023123)).toBe('0.0102')
    expect(toPlacesString(0)).toBe('0')
    expect(toPlacesString(1000000)).toBe('1000000.0000')
    expect(toPlacesString(123)).toBe('123.0000')
    expect(toPlacesString(123.000000123)).toBe('123.0000')
  })
})
