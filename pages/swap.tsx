import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { SwapContainer } from '../containers/swap-container'
import { useChainContext } from '../contexts/chain-context'
import { testnetChainIds } from '../constants/chain'

export default function Swap() {
  const router = useRouter()
  const { selectedChain } = useChainContext()

  useEffect(() => {
    if (testnetChainIds.includes(selectedChain.id)) {
      router.push(`/limit?chain=${selectedChain.id}`)
      return
    }
  }, [router, selectedChain])
  return <SwapContainer />
}
