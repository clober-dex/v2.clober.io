import React from 'react'

export const PageButton = ({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="group flex flex-row gap-2 items-center text-gray-500 font-semibold disabled:text-white stroke-gray-500 fill-gray-500 disabled:stroke-blue-500 disabled:fill-blue-500"
    >
      {children}
    </button>
  )
}
