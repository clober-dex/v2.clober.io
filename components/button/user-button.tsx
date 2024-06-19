import React from 'react'

import UserIcon from '../icon/user-icon'
import { textStyles } from '../../themes/text-styles'
import { formatAddress } from '../../utils/string'

export const UserButton = ({
  address,
  openAccountModal,
}: {
  address: `0x${string}`
  openAccountModal: () => void
}) => {
  return (
    <button
      className="flex items-center justify-center gap-2 md:justify-start rounded md:w-full py-0 px-2 md:px-4 cursor-pointer h-8 bg-gray-800 md:bg-gray-950 hover:bg-gray-600 active::bg-gray-600"
      onClick={() => openAccountModal && openAccountModal()}
    >
      <UserIcon
        className="w-4 h-4 rounded-[100%] aspect-square"
        address={address}
      />
      <span className={`hidden md:block text-white ${textStyles.body3Bold}`}>
        {formatAddress(address || '')}
      </span>
    </button>
  )
}
