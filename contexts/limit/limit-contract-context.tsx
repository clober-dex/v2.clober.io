import React from 'react'

type LimitContractContext = {}

const Context = React.createContext<LimitContractContext>({})

export const LimitContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
