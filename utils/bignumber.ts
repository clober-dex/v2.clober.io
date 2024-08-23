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

export const toPlacesString = (
  number: BigNumber.Value,
  places: number = 4,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_FLOOR,
): string => {
  return new BigNumber(number).toFixed(places, roundingMode)
}

export const toPlacesAmountString = (
  number: BigNumber.Value,
  price: number,
): string => {
  const underHalfPennyDecimals =
    Math.floor(Math.max(-Math.log10(0.005 / price), 0) / 2) * 2
  return new BigNumber(number).toFixed(underHalfPennyDecimals)
}
