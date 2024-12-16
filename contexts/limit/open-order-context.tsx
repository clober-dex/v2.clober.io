import React from 'react'
import { useAccount, useQuery } from 'wagmi'
import { getOpenOrders, OpenOrder } from '@clober/v2-sdk'

import { useChainContext } from '../chain-context'

type OpenOrderContext = {
  openOrders: OpenOrder[]
}

const Context = React.createContext<OpenOrderContext>({
  openOrders: [],
})

export const OpenOrderProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { selectedChain } = useChainContext()

  const { data: openOrders } = useQuery(
    ['open-orders', selectedChain.id, userAddress],
    () =>
      userAddress
        ? getOpenOrders({
            chainId: selectedChain.id,
            userAddress,
          })
        : [],
    {
      refetchIntervalInBackground: true,
      refetchInterval: 2 * 1000,
      initialData: [],
    },
  )

  return (
    <Context.Provider
      value={{
        openOrders: openOrders ?? [],
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useOpenOrderContext = () =>
  React.useContext(Context) as OpenOrderContext
