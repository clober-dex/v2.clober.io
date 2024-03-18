import { CHAIN_IDS } from '../constants/chain'
import { Market } from '../model/market'
import { dummyMarkets } from '../.storybook/dummy-data/markets'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchMarkets(chainId: CHAIN_IDS): Promise<Market[]> {
  return dummyMarkets
}
