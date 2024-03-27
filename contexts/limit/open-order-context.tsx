import React from 'react'
import { useAccount, useQuery } from 'wagmi'

import { useChainContext } from '../chain-context'
import { fetchOpenOrders } from '../../apis/open-orders'
import { OpenOrder } from '../../model/open-order'

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
    ['open-orders', selectedChain, userAddress],
    () => (userAddress ? fetchOpenOrders(selectedChain.id, userAddress) : []),
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
