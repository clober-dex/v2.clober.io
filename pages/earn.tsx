import React, { useEffect } from 'react'

import { PoolContainer } from '../containers/pool-container'
import { useChainContext } from '../contexts/chain-context'
import { cleanAndSetQueryParams } from '../utils/url'

export default function Earn() {
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (!mounted) {
      cleanAndSetQueryParams(['chain'], {})
      setMounted(true)
    }
  }, [mounted, selectedChain])

  return <PoolContainer />
}
