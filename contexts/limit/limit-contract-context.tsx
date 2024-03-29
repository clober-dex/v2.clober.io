import React, { useCallback } from 'react'
import { usePublicClient, useQueryClient, useWalletClient } from 'wagmi'
import {
  encodeAbiParameters,
  isAddressEqual,
  parseUnits,
  zeroAddress,
  zeroHash,
} from 'viem'

import { useChainContext } from '../chain-context'
import { Currency } from '../../model/currency'
import { Confirmation, useTransactionContext } from '../transaction-context'
import { CHAIN_IDS } from '../../constants/chain'
import { CONTRACT_ADDRESSES } from '../../constants/addresses'
import { permit20 } from '../../utils/permit20'
import { getDeadlineTimestampInSeconds } from '../../utils/date'
import { toPlacesString } from '../../utils/bignumber'
import { formatUnits } from '../../utils/bigint'
import { toId } from '../../utils/book-id'
import { MAKER_DEFAULT_POLICY, TAKER_DEFAULT_POLICY } from '../../constants/fee'
import { writeContract } from '../../utils/wallet'
import { CONTROLLER_ABI } from '../../abis/core/controller-abi'
import { WETH_ADDRESSES } from '../../constants/currency'
import { fromPrice, invertPrice } from '../../utils/tick'
import { calculateUnit } from '../../utils/unit'
import { isOpen } from '../../utils/book'
import { BookKey } from '../../model/book-key'
import { getMarketId } from '../../utils/market'
import { OpenOrder } from '../../model/open-order'
import { fetchIsApprovedForAll } from '../../utils/approval'
import { ERC721_ABI } from '../../abis/@openzeppelin/erc721-abi'
import { Market } from '../../model/market'

type LimitContractContext = {
  make: (
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: bigint,
    price: bigint,
  ) => Promise<void>
  limit: (
    market: Market,
    inputCurrency: Currency,
    outputCurrency: Currency,
    amount: bigint,
    price: bigint,
  ) => Promise<void>
  cancels: (openOrders: OpenOrder[]) => Promise<void>
  claims: (openOrders: OpenOrder[]) => Promise<void>
}

const Context = React.createContext<LimitContractContext>({
  make: () => Promise.resolve(),
  limit: () => Promise.resolve(),
  cancels: () => Promise.resolve(),
  claims: () => Promise.resolve(),
})

enum Action {
  OPEN,
  MAKE,
  LIMIT,
  TAKE,
  SPEND,
  CLAIM,
  CANCEL,
}

const TAKE_ABI = [
  {
    components: [
      {
        internalType: 'BookId',
        name: 'id',
        type: 'uint192',
      },
      {
        internalType: 'uint256',
        name: 'limitPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'quoteAmount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'hookData',
        type: 'bytes',
      },
    ],
    internalType: 'struct IController.TakeOrderParams',
    name: 'params',
    type: 'tuple',
  },
]

const MAKE_ABI = [
  {
    components: [
      {
        internalType: 'BookId',
        name: 'id',
        type: 'uint192',
      },
      {
        internalType: 'Tick',
        name: 'tick',
        type: 'int24',
      },
      {
        internalType: 'uint256',
        name: 'quoteAmount',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'hookData',
        type: 'bytes',
      },
    ],
    internalType: 'struct IController.MakeOrderParams',
    name: 'params',
    type: 'tuple',
  },
]

export const LimitContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { setConfirmation } = useTransactionContext()
  const { selectedChain } = useChainContext()

  const make = useCallback(
    async (
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: bigint,
      price: bigint,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const { quote } = getMarketId(selectedChain.id, [
        inputCurrency.address,
        outputCurrency.address,
      ])
      const isBid = isAddressEqual(inputCurrency.address, quote)
      const tick = isBid ? fromPrice(price) : fromPrice(invertPrice(price))
      try {
        const unit = await calculateUnit(selectedChain.id, inputCurrency)
        const key: BookKey = {
          base: outputCurrency.address,
          unit,
          quote: inputCurrency.address,
          makerPolicy: MAKER_DEFAULT_POLICY,
          hooks: zeroAddress,
          takerPolicy: TAKER_DEFAULT_POLICY,
        }
        const param = {
          id: toId(key),
          tick,
          quoteAmount: amount,
          hookData: zeroHash,
        }

        const open = await isOpen(selectedChain.id, key)
        if (!open) {
          setConfirmation({
            title: `Open Book`,
            body: 'Please confirm in your wallet.',
            fields: [],
          })

          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'open',
            args: [
              [
                {
                  key: {
                    base: key.base,
                    unit: Number(key.unit),
                    quote: key.quote,
                    makerPolicy: Number(key.makerPolicy.value),
                    hooks: key.hooks,
                    takerPolicy: Number(key.takerPolicy.value),
                  },
                  hookData: param.hookData,
                },
              ],
              getDeadlineTimestampInSeconds(),
            ],
          })
        }

        const permitAmount = !isAddressEqual(inputCurrency.address, zeroAddress)
          ? amount
          : 0n
        const { deadline, r, s, v } = await permit20(
          selectedChain.id,
          walletClient,
          inputCurrency,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          permitAmount,
          getDeadlineTimestampInSeconds(),
        )

        setConfirmation({
          title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
          body: 'Please confirm in your wallet.',
          fields: [
            {
              currency: inputCurrency,
              label: inputCurrency.symbol,
              value: toPlacesString(
                formatUnits(amount, inputCurrency.decimals),
              ),
              direction: 'in',
            },
          ],
        })

        const tokensToSettle = [inputCurrency.address, outputCurrency.address]
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        await writeContract(publicClient, walletClient, {
          address: CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          abi: CONTROLLER_ABI,
          functionName: 'make',
          args: [
            [param],
            tokensToSettle,
            [
              {
                token: inputCurrency.address,
                permitAmount,
                signature: { deadline, v, r, s },
              },
            ],
            getDeadlineTimestampInSeconds(),
          ],
          value: isAddressEqual(inputCurrency.address, zeroAddress)
            ? amount
            : 0n,
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['limit-balances']),
          queryClient.invalidateQueries(['open-orders']),
          queryClient.invalidateQueries(['markets']),
        ])
        setConfirmation(undefined)
      }
    },
    [publicClient, queryClient, selectedChain, setConfirmation, walletClient],
  )

  const limit = useCallback(
    async (
      market: Market,
      inputCurrency: Currency,
      outputCurrency: Currency,
      amount: bigint,
      price: bigint,
    ) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const isBid = isAddressEqual(inputCurrency.address, market.quote.address)
      const tick = isBid ? fromPrice(price) : fromPrice(invertPrice(price))
      try {
        const unit = await calculateUnit(selectedChain.id, inputCurrency)
        const key = {
          base: outputCurrency.address,
          unit,
          quote: inputCurrency.address,
          makerPolicy: MAKER_DEFAULT_POLICY,
          hooks: zeroAddress,
          takerPolicy: TAKER_DEFAULT_POLICY,
        }
        const makeParam = {
          id: toId(key),
          tick,
          quoteAmount: amount,
          hookData: zeroHash,
        }

        const open = await isOpen(selectedChain.id, key)
        if (!open) {
          setConfirmation({
            title: `Open Book`,
            body: 'Please confirm in your wallet.',
            fields: [],
          })

          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'open',
            args: [
              [
                {
                  key: {
                    base: key.base,
                    unit: Number(key.unit),
                    quote: key.quote,
                    makerPolicy: Number(key.makerPolicy.value),
                    hooks: key.hooks,
                    takerPolicy: Number(key.takerPolicy.value),
                  },
                  hookData: makeParam.hookData,
                },
              ],
              getDeadlineTimestampInSeconds(),
            ],
          })
        }

        const permitAmount = !isAddressEqual(inputCurrency.address, zeroAddress)
          ? amount
          : 0n
        const { deadline, r, s, v } = await permit20(
          selectedChain.id,
          walletClient,
          inputCurrency,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          permitAmount,
          getDeadlineTimestampInSeconds(),
        )

        const tokensToSettle = [inputCurrency.address, outputCurrency.address]
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        const result = new Market({
          chainId: selectedChain.id,
          tokens: [market.base, market.quote],
          makerPolicy: MAKER_DEFAULT_POLICY,
          hooks: market.hooks,
          takerPolicy: TAKER_DEFAULT_POLICY,
          latestPrice: market.latestPrice,
          latestTimestamp: market.latestTimestamp,
          books: market.books,
        }).spend({
          spendBase: !isBid,
          limitPrice: price,
          amountIn: amount,
        })

        if (Object.keys(result).length === 0) {
          setConfirmation({
            title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
            body: 'Please confirm in your wallet.',
            fields: [
              {
                currency: inputCurrency,
                label: inputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(amount, inputCurrency.decimals),
                ),
                direction: 'in',
              },
            ],
          })

          // only make
          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'make',
            args: [
              [makeParam],
              tokensToSettle,
              [
                {
                  token: inputCurrency.address,
                  permitAmount,
                  signature: { deadline, v, r, s },
                },
              ],
              getDeadlineTimestampInSeconds(),
            ],
            value: isAddressEqual(inputCurrency.address, zeroAddress)
              ? amount
              : 0n,
          })
        } else if (Object.keys(result).length === 1) {
          setConfirmation({
            title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
            body: 'Please confirm in your wallet.',
            fields: [
              {
                currency: inputCurrency,
                label: inputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(amount, inputCurrency.decimals),
                ),
                direction: 'in',
              },
              {
                currency: outputCurrency,
                label: outputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(
                    Object.values(result).reduce(
                      (acc, { takenAmount }) => acc + takenAmount,
                      0n,
                    ),
                    outputCurrency.decimals,
                  ),
                ),
                direction: 'out',
              },
            ].filter(
              ({ value, currency }) =>
                parseUnits(value, currency.decimals) > 0n,
            ) as Confirmation['fields'],
          })

          // limit
          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'limit',
            args: [
              [
                {
                  takeBookId: Object.keys(result)[0],
                  makeBookId: makeParam.id,
                  limitPrice: price,
                  tick: makeParam.tick,
                  quoteAmount: amount,
                  takeHookData: zeroHash,
                  makeHookData: makeParam.hookData,
                },
              ],
              tokensToSettle,
              [
                {
                  token: inputCurrency.address,
                  permitAmount,
                  signature: { deadline, v, r, s },
                },
              ],
              getDeadlineTimestampInSeconds(),
            ],
            value: isAddressEqual(inputCurrency.address, zeroAddress)
              ? amount
              : 0n,
          })
        } else {
          setConfirmation({
            title: `Limit ${isBid ? 'Bid' : 'Ask'}`,
            body: 'Please confirm in your wallet.',
            fields: [
              {
                currency: inputCurrency,
                label: inputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(amount, inputCurrency.decimals),
                ),
                direction: 'in',
              },
              {
                currency: outputCurrency,
                label: outputCurrency.symbol,
                value: toPlacesString(
                  formatUnits(
                    Object.values(result).reduce(
                      (acc, { takenAmount }) => acc + takenAmount,
                      0n,
                    ),
                    outputCurrency.decimals,
                  ),
                ),
                direction: 'out',
              },
            ].filter(
              ({ value, currency }) =>
                parseUnits(value, currency.decimals) > 0n,
            ) as Confirmation['fields'],
          })
          const makeAmount =
            amount -
            Object.values(result).reduce(
              (acc, { spendAmount }) => acc + spendAmount,
              0n,
            )

          // execute
          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
            abi: CONTROLLER_ABI,
            functionName: 'execute',
            args: [
              [
                ...Object.values(result).map(() => Action.TAKE),
                ...(makeAmount > 0n ? [Action.MAKE] : []),
              ],
              [
                ...Object.entries(result).map(([bookId, { takenAmount }]) =>
                  encodeAbiParameters(TAKE_ABI, [
                    {
                      id: BigInt(bookId),
                      limitPrice: price,
                      quoteAmount: takenAmount,
                      hookData: zeroHash,
                    },
                  ]),
                ),
                ...(makeAmount > 0n
                  ? [
                      encodeAbiParameters(MAKE_ABI, [
                        {
                          id: BigInt(makeParam.id),
                          tick: Number(tick),
                          quoteAmount: makeAmount,
                          hookData: zeroHash,
                        },
                      ]),
                    ]
                  : []),
              ],
              tokensToSettle,
              [
                {
                  token: inputCurrency.address,
                  permitAmount,
                  signature: { deadline, v, r, s },
                },
              ],
              [],
              getDeadlineTimestampInSeconds(),
            ],
            value: isAddressEqual(inputCurrency.address, zeroAddress)
              ? amount
              : 0n,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['limit-balances']),
          queryClient.invalidateQueries(['open-orders']),
          queryClient.invalidateQueries(['markets']),
        ])
        setConfirmation(undefined)
      }
    },
    [publicClient, queryClient, selectedChain, setConfirmation, walletClient],
  )

  const cancels = useCallback(
    async (openOrders: OpenOrder[]) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const refundCurrencyMaps: {
        [currency: `0x${string}`]: {
          currency: Currency
          amount: bigint
        }
      } = Object.fromEntries(
        Object.entries(
          openOrders.reduce(
            (acc, order) => {
              const refundCurrency = order.inputToken
              const claimCurrency = order.outputToken
              if (!acc[refundCurrency.address]) {
                acc[refundCurrency.address] = {
                  currency: refundCurrency,
                  amount: 0n,
                }
              }
              if (!acc[claimCurrency.address]) {
                acc[claimCurrency.address] = {
                  currency: claimCurrency,
                  amount: 0n,
                }
              }
              acc[refundCurrency.address].amount +=
                order.quoteAmount - order.baseFilledAmount
              acc[claimCurrency.address].amount += order.claimableAmount
              return acc
            },
            {} as {
              [currency: `0x${string}`]: {
                currency: Currency
                amount: bigint
              }
            },
          ),
        ).filter(([, { amount }]) => amount > 0n),
      )

      try {
        const isApprovedForAll = await fetchIsApprovedForAll(
          selectedChain.id,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
        )
        if (!isApprovedForAll) {
          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
            abi: ERC721_ABI,
            functionName: 'setApprovalForAll',
            args: [
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
              true,
            ],
          })
        }

        setConfirmation({
          title: `Cancel Order`,
          body: 'Please confirm in your wallet.',
          fields: Object.values(refundCurrencyMaps).map(
            ({ currency, amount }) => ({
              currency,
              direction: 'out',
              label: currency.symbol,
              value: toPlacesString(formatUnits(amount, currency.decimals)),
            }),
          ),
        })

        const tokensToSettle = Object.values(refundCurrencyMaps)
          .map(({ currency }) => currency.address)
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        await writeContract(publicClient, walletClient, {
          address: CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          abi: CONTROLLER_ABI,
          functionName: 'cancel',
          args: [
            openOrders.map((order) => ({
              id: order.id,
              leftQuoteAmount: 0n,
              hookData: zeroHash,
            })),
            tokensToSettle,
            [],
            getDeadlineTimestampInSeconds(),
          ],
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['limit-balances']),
          queryClient.invalidateQueries(['open-orders']),
          queryClient.invalidateQueries(['markets']),
        ])
        setConfirmation(undefined)
      }
    },
    [publicClient, queryClient, selectedChain, setConfirmation, walletClient],
  )

  const claims = useCallback(
    async (openOrders: OpenOrder[]) => {
      if (!walletClient || !selectedChain) {
        return
      }

      const claimCurrencyMaps: {
        [currency: `0x${string}`]: {
          currency: Currency
          amount: bigint
        }
      } = openOrders.reduce(
        (acc, order) => {
          const claimCurrency = order.outputToken
          if (!acc[claimCurrency.address]) {
            acc[claimCurrency.address] = {
              currency: claimCurrency,
              amount: 0n,
            }
          }
          acc[claimCurrency.address].amount += order.claimableAmount
          return acc
        },
        {} as {
          [currency: `0x${string}`]: {
            currency: Currency
            amount: bigint
          }
        },
      )

      try {
        const isApprovedForAll = await fetchIsApprovedForAll(
          selectedChain.id,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
          walletClient.account.address,
          CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
        )
        if (!isApprovedForAll) {
          await writeContract(publicClient, walletClient, {
            address:
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].BookManager,
            abi: ERC721_ABI,
            functionName: 'setApprovalForAll',
            args: [
              CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
              true,
            ],
          })
        }

        setConfirmation({
          title: `Claim Order`,
          body: 'Please confirm in your wallet.',
          fields: Object.values(claimCurrencyMaps).map(
            ({ currency, amount }) => ({
              currency,
              direction: 'out',
              label: currency.symbol,
              value: toPlacesString(formatUnits(amount, currency.decimals)),
            }),
          ),
        })

        const tokensToSettle = Object.values(claimCurrencyMaps)
          .map(({ currency }) => currency.address)
          .filter((address) => !isAddressEqual(address, zeroAddress))
          .filter(
            (address) =>
              !WETH_ADDRESSES[selectedChain.id as CHAIN_IDS].includes(address),
          )

        await writeContract(publicClient, walletClient, {
          address: CONTRACT_ADDRESSES[selectedChain.id as CHAIN_IDS].Controller,
          abi: CONTROLLER_ABI,
          functionName: 'claim',
          args: [
            openOrders.map((order) => ({
              id: order.id,
              hookData: zeroHash,
            })),
            tokensToSettle,
            [],
            getDeadlineTimestampInSeconds(),
          ],
        })
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries(['limit-balances']),
          queryClient.invalidateQueries(['open-orders']),
          queryClient.invalidateQueries(['markets']),
        ])
        setConfirmation(undefined)
      }
    },
    [publicClient, queryClient, selectedChain, setConfirmation, walletClient],
  )

  return (
    <Context.Provider value={{ limit, make, cancels, claims }}>
      {children}
    </Context.Provider>
  )
}

export const useLimitContractContext = () =>
  React.useContext(Context) as LimitContractContext
