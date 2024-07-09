import React from 'react'
import { createPortal } from 'react-dom'

import { Currency } from '../../model/currency'
import { CurrencyIcon } from '../icon/currency-icon'
import { shortAddress } from '../../utils/address'

const InspectCurrencyModal = ({
  currency,
  onCurrencySelect,
  setInspectingCurrency,
}: {
  currency: Currency | undefined
  onCurrencySelect: (currency: Currency) => void
  setInspectingCurrency: (currency: Currency | undefined) => void
}) => {
  if (!currency) {
    return <></>
  }

  return createPortal(
    <div className="flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 z-[1000] backdrop-blur-sm px-4 sm:px-0">
      <div
        className="flex flex-col w-auto h-auto bg-gray-900 text-white rounded-xl sm:rounded-2xl p-4 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-col p-6 items-center justify-center gap-6 w-full mx-2 sm:mx-0 sm:w-[432px] box-border">
          <div className="flex items-center">
            <div
              className="flex w-6 h-6 p-[3px] justify-center items-center shrink-0 cursor-pointer"
              onClick={() => setInspectingCurrency(undefined)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M12 16.5L4.5 9L12 1.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <div className="flex justify-center items-center flex-grow">
              <div className="text-white text-center text-xl font-bold">
                Import a token
              </div>
            </div>
            <div className="flex w-6 h-6 p-[3px] justify-center items-center shrink-0" />
          </div>
        </div>
        <button
          key={currency.address}
          className="flex w-full px-4 py-2 items-center justify-start text-start rounded-lg"
        >
          <div className="flex items-center gap-3">
            <CurrencyIcon
              currency={currency}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
            />
            <div className="flex-col justify-center items-start gap-[2px]">
              <div className="flex items-center gap-1">
                <div className="text-sm sm:text-base font-bold text-white">
                  {currency.symbol}
                </div>
                {!currency.isVerified ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8.9073 4.41123C9.38356 3.55396 10.6164 3.55396 11.0927 4.41122L16.6937 14.493C17.1565 15.3261 16.5541 16.35 15.601 16.35H4.39903C3.44592 16.35 2.84346 15.3261 3.30633 14.493L8.9073 4.41123Z"
                      stroke="#FACC15"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M10 9V10.8"
                      stroke="#FACC15"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="9.99961" cy="13.5" r="0.9" fill="#FACC15" />
                  </svg>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">{currency.name}</div>
                {!currency.isVerified ? (
                  <button
                    className="flex px-1 py-[2px] justify-center items-center gap-1 rounded bg-[#2B3544] active:ring-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(currency.address)
                    }}
                  >
                    <div className="text-white text-xs margin">
                      {shortAddress(currency.address)}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2.006 8.3685C1.85267 8.28109 1.72514 8.15475 1.63629 8.00225C1.54744 7.84975 1.50043 7.67649 1.5 7.5V3.25C1.5 2 2.25 1.5 3.25 1.5L7.5 1.5C7.875 1.5 8.079 1.6925 8.25 2M3.5 4.8335C3.5 4.47983 3.64049 4.14065 3.89057 3.89057C4.14065 3.64049 4.47983 3.5 4.8335 3.5H9.1665C9.34162 3.5 9.51502 3.53449 9.67681 3.60151C9.8386 3.66852 9.9856 3.76675 10.1094 3.89057C10.2333 4.0144 10.3315 4.1614 10.3985 4.32319C10.4655 4.48498 10.5 4.65838 10.5 4.8335V9.1665C10.5 9.34162 10.4655 9.51502 10.3985 9.67681C10.3315 9.8386 10.2333 9.9856 10.1094 10.1094C9.9856 10.2333 9.8386 10.3315 9.67681 10.3985C9.51502 10.4655 9.34162 10.5 9.1665 10.5H4.8335C4.65838 10.5 4.48498 10.4655 4.32319 10.3985C4.1614 10.3315 4.0144 10.2333 3.89057 10.1094C3.76675 9.9856 3.66852 9.8386 3.60151 9.67681C3.53449 9.51502 3.5 9.34162 3.5 9.1665V4.8335Z"
                        stroke="#9CA3AF"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </button>
        <div className="flex-col w-full mx-2 sm:mx-0 sm:w-[432px] p-4 items-center gap-4 bg-gray-800 rounded-lg">
          <div className="self-stretch text-white text-xs">
            Anyone can create any token, including fake versions of the existing
            tokens. Take due care. Some tokens and their technical parameters
            may be incompatible with clober services. By importing this custom
            token you acknowledge and accept the risks.{' '}
            <a
              className="text-[#3B82F6]"
              href={'https://docs.clober.io'}
              target="_blank"
              rel="noreferrer"
            >
              Learn more →
            </a>
          </div>
        </div>
        <button className="mt-20 flex w-full mx-2 sm:mx-0 sm:w-[432px] h-16 py-3 px-6 justify-center items-center gap-2 shrink-0 bg-blue-500 rounded-lg">
          <div
            className="flex-grow text-white text-center text-xl font-bold"
            onClick={() => onCurrencySelect(currency)}
          >
            Accept and confirm
          </div>
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default InspectCurrencyModal
