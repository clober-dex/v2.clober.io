import React, { useEffect } from 'react'

import { LimitContainer } from '../containers/limit-container'
import { cleanAndSetQueryParams } from '../utils/url'
import { useChainContext } from '../contexts/chain-context'
import { getCurrencyAddress } from '../utils/currency'

export default function Limit() {
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (!mounted) {
      const { inputCurrencyAddress, outputCurrencyAddress } =
        getCurrencyAddress('limit', selectedChain)
      cleanAndSetQueryParams(['chain'], {
        inputCurrency: inputCurrencyAddress,
        outputCurrency: outputCurrencyAddress,
      })
      setMounted(true)
    }
  }, [mounted, selectedChain])
  return <LimitContainer />
}
