import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

import { SwapContainer } from '../containers/swap-container'
import { cleanAndSetQueryParams } from '../utils/url'
import { useChainContext } from '../contexts/chain-context'
import { getCurrencyAddress } from '../utils/currency'
import { testnetChainIds } from '../constants/chain'

export default function Swap() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (testnetChainIds.includes(selectedChain.id)) {
      router.replace(`/limit?chain=${selectedChain.id}`, undefined, {
        shallow: true,
      })
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
