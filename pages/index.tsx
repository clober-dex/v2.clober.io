import React from 'react'
import { useRouter } from 'next/router'

import { useChainContext } from '../contexts/chain-context'
import { useMarketContext } from '../contexts/limit/market-context'

export default function Home() {
  const { selectedChain } = useChainContext()
  const { selectedMarket } = useMarketContext()
  const router = useRouter()
  if (selectedMarket) {
    router.push(
      `/limit?chain=${selectedChain.id}&inputCurrency=${selectedMarket.quote.address}&outputCurrency=${selectedMarket.base.address}`,
    )
  } else {
    router.push(`/limit?chain=${selectedChain.id}`)
  }
  return <div />
}
