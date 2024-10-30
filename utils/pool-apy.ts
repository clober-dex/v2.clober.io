const YEAR_IN_SECONDS = 31536000

export const calculateApy = (p: number, d: number) => {
  return (p ** (YEAR_IN_SECONDS / d) - 1) * 100
}
