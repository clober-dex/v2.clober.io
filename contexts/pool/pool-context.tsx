import React from 'react'

type PoolContext = {
  currency0Amount: string
  setCurrency0Amount: (inputCurrencyAmount: string) => void
  currency1Amount: string
  setCurrency1Amount: (inputCurrencyAmount: string) => void
  asRatio: boolean
  setAsRatio: (asRatio: boolean) => void
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
}

const Context = React.createContext<PoolContext>({
  currency0Amount: '',
  setCurrency0Amount: () => {},
  currency1Amount: '',
  setCurrency1Amount: () => {},
  asRatio: false,
  setAsRatio: () => {},
  slippageInput: '',
  setSlippageInput: () => {},
})

export const PoolProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currency0Amount, setCurrency0Amount] = React.useState('')
  const [currency1Amount, setCurrency1Amount] = React.useState('')
  const [asRatio, setAsRatio] = React.useState(false)
  const [slippageInput, setSlippageInput] = React.useState('')

  return (
    <Context.Provider
      value={{
        currency0Amount,
        setCurrency0Amount,
        currency1Amount,
        setCurrency1Amount,
        asRatio,
        setAsRatio,
        slippageInput,
        setSlippageInput,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const usePoolContext = () => React.useContext(Context) as PoolContext
