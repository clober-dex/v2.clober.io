import BigNumber from 'bignumber.js'

export const getDecimalPlaces = (
  number: BigNumber.Value,
  places: number = 4,
) => {
  const TEN = new BigNumber(10)
  const value = new BigNumber(`0.${number.toString().split('.')[1] || '0'}`)
  if (value.eq(0)) {
    return places
  }
  if (value.gte(TEN.pow(places))) {
    return 0
  }
  let i = 0
  while (value.abs().lt(TEN.pow(-i * places))) {
    i += 1
  }
  return i ? i * places : 4
}

export const toPlacesString = (number: BigNumber.Value, places: number = 4) => {
  const value = new BigNumber(number)
  return value.toFixed(Number(getDecimalPlaces(number, places)))
}
