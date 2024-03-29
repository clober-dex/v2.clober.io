import React, { useEffect } from 'react'

import { cleanAndSetQueryParams } from '../utils/url'
import { useLimitContext } from '../contexts/limit/limit-context'
import { IframeContainer } from '../containers/iframe-container'

export default function Iframe() {
  const { inputCurrency, outputCurrency } = useLimitContext()

  useEffect(() => {
    cleanAndSetQueryParams(['chain'], {
      inputCurrency: inputCurrency?.address,
      outputCurrency: outputCurrency?.address,
    })
  }, [inputCurrency, outputCurrency])
  return <IframeContainer />
}
