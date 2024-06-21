import React, { useEffect } from 'react'

import { SwapContainer } from '../containers/swap-container'
import { cleanAndSetQueryParams } from '../utils/url'
import { useChainContext } from '../contexts/chain-context'
import { getCurrencyAddress } from '../utils/currency'

export default function Swap() {
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (mounted) {
      const { inputCurrencyAddress, outputCurrencyAddress } =
        getCurrencyAddress('swap', selectedChain)
      cleanAndSetQueryParams(['chain'], {
        inputCurrency: inputCurrencyAddress,
        outputCurrency: outputCurrencyAddress,
      })
      setMounted(true)
    } else {
      cleanAndSetQueryParams(['chain'], {})
    }
  }, [mounted, selectedChain])
  return <SwapContainer />
}
