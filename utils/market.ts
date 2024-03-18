export const getMarketId = (tokenAddresses: `0x${string}`[]) => {
  if (tokenAddresses.length !== 2) {
    throw new Error('Invalid token pair')
  }
  const _tokens = tokenAddresses.sort((a, b) => a.localeCompare(b))
  return {
    marketId: `${_tokens[0]}/${_tokens[1]}`,
    quote: _tokens[0],
    base: _tokens[1],
  }
}
