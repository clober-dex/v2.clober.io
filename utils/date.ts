export const formatDate = (date: Date): string =>
  Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
    .format(date)
    .replace(',', '')

export const currentTimestampInSeconds = (): number =>
  Math.floor(new Date().getTime() / 1000)

export const getDeadlineTimestampInSeconds = (): bigint => {
  return BigInt(Math.floor(currentTimestampInSeconds() + 60 * 20))
}
