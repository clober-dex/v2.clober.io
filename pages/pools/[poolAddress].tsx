import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isAddress } from 'viem'

import { useChainContext } from '../../contexts/chain-context'
import { cleanAndSetQueryParams } from '../../utils/url'
import { PoolManagerContainer } from '../../containers/pool-manager-container'

export default function PoolManage() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (!mounted) {
      cleanAndSetQueryParams(['chain'], {})
      setMounted(true)
    }
  }, [mounted, selectedChain])

  return router.query.poolAddress &&
    isAddress(router.query.poolAddress as string) ? (
    <PoolManagerContainer />
  ) : (
    <></>
  )
}
