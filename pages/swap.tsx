import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { SwapContainer } from '../containers/swap-container'
import { cleanAndSetQueryParams } from '../utils/url'
import { useChainContext } from '../contexts/chain-context'
import { getCurrencyAddress } from '../utils/currency'
import { testnetChainIds } from '../constants/chain'
import { beraTestnetChain } from '../constants/dev-chain'

export default function Swap() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (
      testnetChainIds
        .filter((chainId) => chainId !== beraTestnetChain.id)
        .includes(selectedChain.id)
    ) {
      router.push(`/limit?chain=${selectedChain.id}`)
      return
    }

    if (!mounted) {
      const { inputCurrencyAddress, outputCurrencyAddress } =
        getCurrencyAddress('swap', selectedChain)
      cleanAndSetQueryParams(['chain'], {
        inputCurrency: inputCurrencyAddress,
        outputCurrency: outputCurrencyAddress,
      })
      setMounted(true)
    }
  }, [mounted, router, selectedChain])
  return <SwapContainer />
}
