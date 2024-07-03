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
  const chainId = Number(localStorage.getItem(LOCAL_STORAGE_CHAIN_KEY) ?? '0')
  const chain = supportChains.find((chain) => chain.id === chainId)
  return (
    <img
      className="rounded-full"
      src={getLogo(currency)}
      onError={(e) => {
        e.currentTarget.src = chain
          ? `https://dd.dexscreener.com/ds-data/tokens/${
              chain.network
            }/${currency.address.toLowerCase()}.png?size=lg`
          : '/unknown.svg'
      }}
      {...props}
    />
  )
}
