import BigNumber from 'bignumber.js'

export const findFirstNonZeroIndex = (number: BigNumber.Value): number => {
  const value = new BigNumber(number)
  const decimalPart = value.minus(value.integerValue())
  if (decimalPart.isZero()) {
    return 0
  }
  let i = 0
  while (
    decimalPart
      .times(10 ** i)
      .integerValue()
      .isZero()
  ) {
    i += 1
  }
  return i
}

export const toPlacesString = (number: BigNumber.Value, places: number = 4) => {
  return new BigNumber(number).toFixed(places, BigNumber.ROUND_FLOOR)
}
