import React from 'react'

import { Currency, getLogo } from '../../model/currency'

export const CurrencyIcon = ({
  currency,
  ...props
}: {
  currency: Currency
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img
      src={getLogo(currency)}
      onError={(e) => {
        e.currentTarget.src = '/unknown.svg'
      }}
      {...props}
    />
  )
}
