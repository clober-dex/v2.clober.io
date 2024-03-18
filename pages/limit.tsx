import React, { useEffect } from 'react'

import { LimitContainer } from '../containers/limit-container'
import { cleanAndSetQueryParams } from '../utils/url'
import { useLimitContext } from '../contexts/limit/limit-context'

export default function Limit() {
  const { inputCurrency, outputCurrency } = useLimitContext()

  useEffect(() => {
    cleanAndSetQueryParams(['chain'], {
      inputCurrency: inputCurrency?.address,
      outputCurrency: outputCurrency?.address,
    })
  }, [inputCurrency, outputCurrency])
  return <LimitContainer />
}
