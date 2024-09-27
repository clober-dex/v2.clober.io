import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useChainContext } from '../../contexts/chain-context'
import { cleanAndSetQueryParams } from '../../utils/url'
import { PoolManagerContainer } from '../../containers/pool-manager-container'
import { usePoolContext } from '../../contexts/pool/pool-context'

export default function PoolManage() {
  const router = useRouter()
  const { pools } = usePoolContext()
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (!mounted) {
      cleanAndSetQueryParams(['chain'], {})
      setMounted(true)
    }
  }, [mounted, selectedChain])

  return router.query.poolKey &&
    pools.find((pool) => pool.key.toLowerCase() === router.query.poolKey) ? (
    <PoolManagerContainer
      pool={
        pools.find((pool) => pool.key.toLowerCase() === router.query.poolKey)!
      }
    />
  ) : (
    <></>
  )
}
