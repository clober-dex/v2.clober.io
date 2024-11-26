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
        className="rounded-full"
        src={chain.icon || `https://assets.odos.xyz/chains/${name}.png`}
        alt="ChainIcon"
        width={18}
        height={18}
      />
    </div>
  )
}
