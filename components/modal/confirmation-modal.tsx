import React from 'react'
import { createPortal } from 'react-dom'

import { Confirmation } from '../../contexts/transaction-context'
import { CurrencyIcon } from '../icon/currency-icon'

const ConfirmationModal = ({
  confirmation,
}: {
  confirmation?: Confirmation
}) => {
  if (!confirmation) {
    return <></>
  }

  return createPortal(
    <div className="flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 z-[1000] backdrop-blur-sm px-4 sm:px-0">
      <div
        className="flex flex-col w-full sm:w-80 bg-gray-800 text-white rounded-xl sm:rounded-2xl p-4 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="font-bold">{confirmation.title}</div>
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {confirmation.body}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {confirmation.fields.map((field, index) => (
            <div key={index} className="flex flex-row gap-1">
              {field.direction === 'in' ? (
                <div className="flex text-sm w-9 items-center justify-center bg-red-500 bg-opacity-10 font-bold text-red-500 px-6 rounded-lg">
                  -
                </div>
              ) : (
                <></>
              )}
              {field.direction === 'out' ? (
                <div className="flex text-sm w-9 items-center justify-center bg-green-500 bg-opacity-10 font-bold text-green-500 px-6 rounded-lg">
                  +
                </div>
              ) : (
                <></>
              )}
              <div className="flex w-full items-center justify-between bg-gray-700 px-3 py-2 text-sm sm:text-base rounded-lg">
                <div className="flex items-center gap-2">
                  {field.currency ? (
                    <CurrencyIcon
                      currency={field.currency}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <></>
                  )}
                  <div>{field.label}</div>
                </div>
                <div>{field.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmationModal
