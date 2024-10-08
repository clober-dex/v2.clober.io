const YEAR_IN_SECONDS = 31536000
export const calculatePoolApy = (
  historicalLpPrice: {
    timestamp: number
    price: number
  }[],
) => {
  if (historicalLpPrice.length === 0) {
    throw new Error('No historical data')
  }

  historicalLpPrice = historicalLpPrice.sort(
    (a, b) => a.timestamp - b.timestamp,
  )
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000)
  const todayTimestampInSeconds =
    currentTimestampInSeconds - (currentTimestampInSeconds % (24 * 60 * 60))
  const thirtyDaysAgoTimestampInSeconds =
    todayTimestampInSeconds - 30 * 24 * 60 * 60

  const isHistoricalDataHasThirtyDaysAgo = historicalLpPrice.find(
    (data) => data.timestamp >= thirtyDaysAgoTimestampInSeconds,
  )
  if (!isHistoricalDataHasThirtyDaysAgo) {
    return calculateApy(
      historicalLpPrice[historicalLpPrice.length - 1].price /
        historicalLpPrice[0].price,
      historicalLpPrice[historicalLpPrice.length - 1].timestamp -
        historicalLpPrice[0].timestamp,
    )
  } else {
    const { price: startLpPrice } = historicalLpPrice.find(
      (data) => data.timestamp >= thirtyDaysAgoTimestampInSeconds,
    )!
    return calculateApy(
      historicalLpPrice[historicalLpPrice.length - 1].price / startLpPrice,
      30 * 24 * 60 * 60,
    )
  }
}

const calculateApy = (p: number, d: number) => {
  return (p ** (YEAR_IN_SECONDS / d) - 1) * 100
}
