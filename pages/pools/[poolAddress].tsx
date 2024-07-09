import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { isAddress } from 'viem'

import { useChainContext } from '../../contexts/chain-context'
import { cleanAndSetQueryParams } from '../../utils/url'
import { PoolManagerContainer } from '../../containers/pool-manager-container'
import { Pool } from '../../model/pool'
import { BERACHAIN_TESTNET_WHITELISTED_CURRENCIES } from '../../constants/currencies/80085'

const pools: Pool[] = BERACHAIN_TESTNET_WHITELISTED_CURRENCIES.map(
  (currency) => {
    return {
      lpCurrency: currency,
      currency0: currency,
      currency1: currency,
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
    }
  },
)

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
    <PoolManagerContainer
      pool={
        pools.find(
          (pool) => pool.lpCurrency.address === router.query.poolAddress,
        )!
      }
    />
  ) : (
    <></>
  )
}
