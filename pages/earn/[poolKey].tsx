import React from 'react'
import { useRouter } from 'next/router'

import { PoolManagerContainer } from '../../containers/pool-manager-container'
import { usePoolContext } from '../../contexts/pool/pool-context'

export default function PoolManage() {
  const router = useRouter()
  const { pools } = usePoolContext()

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
