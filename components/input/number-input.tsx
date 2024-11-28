import React, { useCallback } from 'react'

const NumberInput = ({
  value,
  onValueChange,
  supportNegative = false,
  ...props
}: {
  value: string
  onValueChange: (value: string) => void
  supportNegative?: boolean
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.replace(/[,a-zA-Z]/g, '')

      const regex = supportNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
      if (regex.test(newValue)) {
        if (newValue.length <= 20) {
          onValueChange(newValue)
        }
      }
    },
    [onValueChange, supportNegative],
  )
  return <input value={value} onChange={handleChange} {...props} />
}

export default NumberInput
