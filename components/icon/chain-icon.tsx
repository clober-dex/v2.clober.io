import React from 'react'
import Image from 'next/image'

import { Chain } from '../../model/chain'

export default function ChainIcon({
  chain,
  ...props
}: React.BaseHTMLAttributes<HTMLDivElement> & {
  chain: Chain
}) {
  const name = chain.name.toLowerCase().split(' ')[0]
  return (
    <div {...props}>
      <Image
        src={chain.icon || `https://assets.odos.xyz/chains/${name}.png`}
        alt="ChainIcon"
        width={16}
        height={16}
      />
    </div>
  )
}
