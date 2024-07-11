import React from 'react'

type PoolContractContext = {}

const Context = React.createContext<PoolContractContext>({})

export const PoolContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>
}

export const usePoolContractContext = () =>
  React.useContext(Context) as PoolContractContext
