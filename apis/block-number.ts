import { getBuiltGraphSDK } from '../.graphclient'

const { getLatestBlockNumber } = getBuiltGraphSDK()

export async function fetchLatestSubGraphBlockNumber(): Promise<number> {
  const { _meta: data } = await getLatestBlockNumber()
  return data ? data.block.number : 0
}
