import React from 'react'
import { createPortal } from 'react-dom'

const WarningLimitModal = ({
  marketPrice,
  priceInput,
  marketRateDiff,
  limit,
  closeModal,
}: {
  marketPrice: number
  priceInput: number
  marketRateDiff: number
  limit: () => void
  closeModal: () => void
}) => {
  return createPortal(
    <div
      className="flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 z-[1000] backdrop-blur-sm px-4 sm:px-0"
      onClick={() => closeModal()}
    >
      <div
        className="flex flex-col w-80 sm:w-[480px] h-auto bg-gray-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-4 sm:gap-6 self-stretch">
          <div className="flex flex-col items-start gap-2 sm:gap-4 self-stretch">
            <div className="flex items-start gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="sm:w-6 sm:h-6 w-4 h-4"
              >
                <path
                  d="M21.5533 17.2882L21.5648 17.2766L21.5268 17.2103L14.207 4.43076C14.207 4.4307 14.207 4.43065 14.2069 4.4306C13.7589 3.63883 12.9054 3.15 12 3.15C11.0939 3.15 10.2511 3.63938 9.79345 4.4299L9.79323 4.43028L2.46323 17.2203L2.46317 17.2204C2.25477 17.5851 2.13999 18.0021 2.13999 18.43C2.13999 19.7649 3.22448 20.86 4.56999 20.86H19.41C20.7452 20.86 21.84 19.7652 21.84 18.43C21.84 18.0365 21.7382 17.6444 21.5533 17.2882ZM3.94637 18.0604L3.94675 18.0597L11.2763 5.27057C11.2763 5.27043 11.2764 5.27029 11.2765 5.27014C11.4288 5.01078 11.7059 4.85 12.01 4.85C12.3141 4.85 12.5912 5.01078 12.7435 5.27013C12.7436 5.27028 12.7436 5.27043 12.7437 5.27057L20.0626 18.0486C20.1256 18.1661 20.16 18.2895 20.16 18.41C20.16 18.8148 19.8348 19.14 19.43 19.14H19.3886L19.3786 19.15H4.57999C4.17522 19.15 3.84999 18.8248 3.84999 18.42C3.84999 18.2974 3.88545 18.1648 3.94637 18.0604Z"
                  fill="#F87171"
                  stroke="#F87171"
                  strokeWidth="0.2"
                />
                <path
                  d="M12 14.05C12.4652 14.05 12.85 13.6652 12.85 13.2V10C12.85 9.53477 12.4652 9.15 12 9.15C11.5348 9.15 11.15 9.53477 11.15 10V13.2C11.15 13.6652 11.5348 14.05 12 14.05Z"
                  fill="#F87171"
                  stroke="#F87171"
                  strokeWidth="0.2"
                />
                <path
                  d="M12 17.1C12.497 17.1 12.9 16.6971 12.9 16.2C12.9 15.703 12.497 15.3 12 15.3C11.5029 15.3 11.1 15.703 11.1 16.2C11.1 16.6971 11.5029 17.1 12 17.1Z"
                  fill="#F87171"
                  stroke="#F87171"
                  strokeWidth="0.2"
                />
              </svg>
              <div className="text-red-400 text-sm sm:text-lg font-bold leading-tight">
                Warning
              </div>
            </div>
            <div className="text-white text-sm sm:text-base">
              You’re trying to place an unfavorable order that is far from the
              market price. Are you sure you want to proceed?
            </div>
          </div>

          <div className="w-full p-4 bg-[#303742] rounded-xl flex-col justify-center items-start gap-2 flex">
            <div className="flex flex-col sm:flex-row w-full items-start gap-1 self-stretch">
              <div className="text-gray-300 text-xs sm:text-sm">
                Current market price
              </div>
              <div className="flex ml-auto">{marketPrice}</div>
            </div>
            <div className="flex flex-col sm:flex-row w-full items-start gap-1 self-stretch">
              <div className="text-gray-300 text-xs sm:text-sm flex flex-row gap-1">
                Your order price
                {marketRateDiff >= 10000 ? (
                  <div className="font-semibold text-green-400">
                    (&gt;10000%)
                  </div>
                ) : !isNaN(marketRateDiff) ? (
                  <div
                    className={`text-gray-200 ${
                      marketRateDiff >= 0 ? 'text-green-400' : 'text-red-400'
                    } sm:text-sm font-semibold`}
                  >
                    ({marketRateDiff.toFixed(2)}%)
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex ml-auto">{priceInput}</div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 self-stretch">
          <button
            onClick={limit}
            className="w-full h-11 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl justify-center items-center flex opacity-90 text-center text-white text-sm font-semibold"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default WarningLimitModal
