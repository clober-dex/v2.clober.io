import React, { useEffect } from 'react'

import { cleanAndSetQueryParams } from '../utils/url'
import { IframeContainer } from '../containers/iframe-container'
import { getCurrencyAddress } from '../utils/currency'
import { useChainContext } from '../contexts/chain-context'

export default function Iframe() {
  const { selectedChain } = useChainContext()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    if (!mounted) {
      const { inputCurrencyAddress, outputCurrencyAddress } =
        getCurrencyAddress('iframe', selectedChain)
      cleanAndSetQueryParams(['chain'], {
        inputCurrency: inputCurrencyAddress,
        outputCurrency: outputCurrencyAddress,
      })
      setMounted(true)
    }
  }, [mounted, selectedChain])
  return <IframeContainer />
}
