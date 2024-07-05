import React from 'react'

export const VaultContainer = () => {
  return (
    <div className="w-full flex flex-col text-white">
      <div className="flex justify-center w-auto h-[400px] bg-gradient-to-t from-slate-900 to-slate-900">
        <div className="w-[960px] h-[232px] mt-16 flex flex-col gap-12 items-center">
          <div className="flex w-[261px] h-[72px] flex-col justify-start items-center gap-3">
            <div className="self-stretch text-center text-white text-4xl font-bold">
              Pool
            </div>
            <div className="self-stretch text-center text-gray-400 text-sm font-bold">
              Provide liquidity and earn fees!
            </div>
          </div>
          <div>2</div>
        </div>
      </div>
      <div className="flex">Down</div>
    </div>
  )
}
