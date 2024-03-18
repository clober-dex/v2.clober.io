import React, { useContext } from 'react'

import ConfirmationModal from '../components/modal/confirmation-modal'
import { Currency } from '../model/currency'
import { sanitizeNumber } from '../utils/numbers'

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
  const [confirmation, _setConfirmation] = React.useState<Confirmation>()
  const setConfirmation = (confirmation?: Confirmation) => {
    const refinedConfirmation = confirmation
      ? {
          ...confirmation,
          fields: confirmation.fields.filter(
            (field) => Number(sanitizeNumber(field.value)) > 0,
          ),
        }
      : undefined
    _setConfirmation(refinedConfirmation)
  }
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
