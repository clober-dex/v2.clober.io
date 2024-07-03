import React from 'react'

import { Currency, getLogo } from '../../model/currency'
import { LOCAL_STORAGE_CHAIN_KEY } from '../../contexts/chain-context'
import { supportChains } from '../../constants/chain'

export const CurrencyIcon = ({
  currency,
  ...props
}: {
  currency: Currency
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [tryCount, setTryCount] = React.useState(0)

  const chainId = Number(localStorage.getItem(LOCAL_STORAGE_CHAIN_KEY) ?? '0')
  const chain = supportChains.find((chain) => chain.id === chainId)
  return (
    <img
      className="rounded-full"
      src={getLogo(currency)}
      onError={(e) => {
        if (tryCount >= 1) {
          e.currentTarget.src = '/unknown.svg'
          return
        }
        e.currentTarget.src = chain
          ? `https://dd.dexscreener.com/ds-data/tokens/${
              chain.network
            }/${currency.address.toLowerCase()}.png?size=lg`
          : '/unknown.svg'
        setTryCount((count) => count + 1)
      }}
      {...props}
    />
  )
}
