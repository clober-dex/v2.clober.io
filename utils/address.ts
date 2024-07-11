export const shortAddress = (address: string, length = 4): string => {
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}
