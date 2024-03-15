import React from 'react'
import { useQuery } from 'wagmi'

import { useChainContext } from '../contexts/chain-context'
import { fetchLatestSubGraphBlockNumber } from '../apis/block-number'

import { BlockNumberWidget } from './block-number-widget'

const Footer = () => {
  const { selectedChain } = useChainContext()
  const { data: latestSubgraphBlockNumber } = useQuery(
    ['latest-subgraph-block-number', selectedChain.id],
    async () => {
      return fetchLatestSubGraphBlockNumber()
    },
    {
      initialData: 0,
      refetchInterval: 10 * 1000,
      refetchIntervalInBackground: true,
    },
  )

  return (
    <>
      <div className="flex h-8 justify-between items-center px-4 text-xs text-gray-500 mb-1 bg-[#0b1933]">
        <div className="flex items-center">
          Support:{' '}
          <a
            href="mailto:official@clober.io"
            className="text-gray-500 hover:text-blue-500"
          >
            official@clober.io
          </a>
        </div>
        <div className="flex w-auto ml-auto">
          Powered by Clober (v
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7)})
        </div>
      </div>
      <BlockNumberWidget latestBlockNumber={latestSubgraphBlockNumber} />
    </>
  )
}

export default Footer
