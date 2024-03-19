import React, { useContext } from 'react'

import ConfirmationModal from '../components/modal/confirmation-modal'
import { Currency } from '../model/currency'

export type Confirmation = {
  title: string
  body: string
  fields: {
    direction?: 'in' | 'out'
    currency?: Currency
    label: string
    value: string
  }[]
}

type TransactionContext = {
  confirmation?: Confirmation
  setConfirmation: (confirmation?: Confirmation) => void
}

const Context = React.createContext<TransactionContext>({
  setConfirmation: () => {},
})

export const TransactionProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const [confirmation, setConfirmation] = React.useState<Confirmation>()
  return (
    <Context.Provider value={{ confirmation, setConfirmation }}>
      {children}
      <ConfirmationModal confirmation={confirmation} />
    </Context.Provider>
  )
}

export function useTransactionContext() {
  return useContext(Context) as TransactionContext
}
