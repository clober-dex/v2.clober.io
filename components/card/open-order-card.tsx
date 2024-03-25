import React from 'react'

import { OutlinkSvg } from '../svg/outlink-svg'
import { OpenOrder } from '../../model/open-order'
import { formatUnits } from '../../utils/bigint'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { toPlacesString } from '../../utils/bignumber'
import { formatPrice } from '../../utils/prices'
import { invertPrice } from '../../utils/tick'

export const OpenOrderCard = ({
  openOrder,
  claimActionButtonProps,
  cancelActionButtonProps,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  openOrder: OpenOrder
  claimActionButtonProps: ActionButtonProps
  cancelActionButtonProps: ActionButtonProps
}) => {
  const filledRatio =
    (Number(openOrder.baseFilledAmount) / Number(openOrder.baseAmount)) * 100
  const quoteCurrencyDecimals = openOrder.isBid
    ? openOrder.inputToken.decimals
    : openOrder.outputToken.decimals
  const baseCurrencyDecimals = openOrder.isBid
    ? openOrder.outputToken.decimals
    : openOrder.inputToken.decimals
  return (
    <div
      className="flex flex-col shadow border border-solid border-gray-800 lg:w-[310px] gap-4 bg-gray-900 rounded-2xl p-4"
      {...props}
    >
      <div className="flex text-sm text-white justify-between">
        <div className="font-bold flex flex-row items-center gap-1">
          {openOrder.inputToken.symbol} &#x2192;{'  '}
          {openOrder.outputToken.symbol}
          <a target="_blank" href={openOrder.txUrl} rel="noreferrer">
            <OutlinkSvg className="w-3 h-3" />
          </a>
        </div>
        <div
          className={`${
            openOrder.isBid ? 'text-green-500' : 'text-red-500'
          } text-sm font-bold`}
        >
          {openOrder.isBid ? 'Bid' : 'Ask'}
        </div>
      </div>
      <div className="flex flex-col text-xs sm:text-sm">
        <div className="flex flex-col align-baseline justify-between gap-2">
          <div className="flex flex-row align-baseline justify-between">
            <label className="text-gray-200">Price</label>
            <p className="text-white">
              {toPlacesString(
                formatPrice(
                  openOrder.isBid
                    ? openOrder.price
                    : invertPrice(openOrder.price),
                  quoteCurrencyDecimals,
                  baseCurrencyDecimals,
                ),
              )}
            </p>
          </div>
          <div className="flex flex-row align-baseline justify-between">
            <label className="text-gray-200">Open amount</label>
            <p className="text-white">
              {toPlacesString(
                formatUnits(openOrder.baseAmount, baseCurrencyDecimals),
              )}
            </p>
          </div>
          <div className="flex flex-row align-baseline justify-between">
            <label className="text-gray-200">Filled</label>
            <div className="flex flex-row gap-1">
              <p className="text-white">{filledRatio.toFixed(2)}%</p>
              <p className="text-gray-400">
                (
                {toPlacesString(
                  formatUnits(openOrder.baseFilledAmount, baseCurrencyDecimals),
                )}
                )
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-lg dark:bg-gray-700">
            <div
              className="flex items-center justify-center h-1.5 bg-blue-500 text-xs font-medium text-gray-100 text-center p-0.5 leading-none rounded-lg"
              style={{
                width: `${filledRatio}%`,
              }}
            />
          </div>
          <div className="flex flex-row align-baseline justify-between">
            <label className="text-gray-200">Claimable</label>
            <p className="text-white">
              {toPlacesString(
                formatUnits(
                  openOrder.claimableAmount,
                  openOrder.outputToken.decimals,
                ),
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-3 h-6">
        <ActionButton
          className="flex flex-1 items-center justify-center rounded bg-gray-700 hover:bg-gray-500 text-white text-xs sm:text-sm disabled:bg-gray-800 disabled:text-gray-500 py-2 h-6 sm:h-7"
          {...claimActionButtonProps}
        />
        <ActionButton
          className="flex flex-1 items-center justify-center rounded bg-gray-700 hover:bg-gray-500 text-white text-xs sm:text-sm disabled:bg-gray-800 disabled:text-gray-500 py-2 h-6 sm:h-7"
          {...cancelActionButtonProps}
        />
      </div>
    </div>
  )
}
