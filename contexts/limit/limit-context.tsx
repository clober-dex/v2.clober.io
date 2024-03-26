import React, { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { useAccount, useBalance, useQuery } from 'wagmi'
import { readContracts } from '@wagmi/core'

import { Currency } from '../../model/currency'
import { formatUnits } from '../../utils/bigint'
import { Decimals, DEFAULT_DECIMAL_PLACES_GROUPS } from '../../model/decimals'
import { formatPrice, getPriceDecimals, MAX_PRICE } from '../../utils/prices'
import { parseDepth } from '../../utils/order-book'
import { useChainContext } from '../chain-context'
import { Chain } from '../../model/chain'
import { getMarketId } from '../../utils/market'
import { Balances } from '../../model/balances'
import { ERC20_PERMIT_ABI } from '../../abis/@openzeppelin/erc20-permit-abi'
import { WHITELISTED_CURRENCIES } from '../../constants/currency'
import { fetchCurrency } from '../../utils/currency'

import { useMarketContext } from './market-context'

type LimitContext = {
  balances: Balances
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  isBid: boolean
  setIsBid: (isBid: (prevState: boolean) => boolean) => void
  selectMode: 'none' | 'settings'
  setSelectMode: (selectMode: 'none' | 'settings') => void
  showInputCurrencySelect: boolean
  setShowInputCurrencySelect: (showInputCurrencySelect: boolean) => void
  inputCurrency: Currency | undefined
  setInputCurrency: (currency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (amount: string) => void
  showOutputCurrencySelect: boolean
  setShowOutputCurrencySelect: (showOutputCurrencySelect: boolean) => void
  outputCurrency: Currency | undefined
  setOutputCurrency: (currency: Currency | undefined) => void
  outputCurrencyAmount: string
  setOutputCurrencyAmount: (amount: string) => void
  claimBounty: string
  setClaimBounty: (amount: string) => void
  isPostOnly: boolean
  setIsPostOnly: (isPostOnly: (prevState: boolean) => boolean) => void
  selectedDecimalPlaces: Decimals | undefined
  setSelectedDecimalPlaces: (decimalPlaces: Decimals | undefined) => void
  priceInput: string
  setPriceInput: (priceInput: string) => void
  availableDecimalPlacesGroups: Decimals[]
  bids: {
    price: string
    size: string
  }[]
  asks: {
    price: string
    size: string
  }[]
}

const Context = React.createContext<LimitContext>({
  balances: {},
  currencies: [],
  setCurrencies: () => {},
  isBid: true,
  setIsBid: () => {},
  selectMode: 'none',
  setSelectMode: () => {},
  showInputCurrencySelect: false,
  setShowInputCurrencySelect: () => {},
  inputCurrency: undefined,
  setInputCurrency: () => {},
  inputCurrencyAmount: '',
  setInputCurrencyAmount: () => {},
  showOutputCurrencySelect: false,
  setShowOutputCurrencySelect: () => {},
  outputCurrency: undefined,
  setOutputCurrency: () => {},
  outputCurrencyAmount: '',
  setOutputCurrencyAmount: () => {},
  claimBounty: '',
  setClaimBounty: () => {},
  isPostOnly: false,
  setIsPostOnly: () => {},
  selectedDecimalPlaces: undefined,
  setSelectedDecimalPlaces: () => {},
  priceInput: '',
  setPriceInput: () => {},
  availableDecimalPlacesGroups: [],
  bids: [],
  asks: [],
})

const LOCAL_STORAGE_INPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-inputCurrency-limit`
const LOCAL_STORAGE_OUTPUT_CURRENCY_KEY = (chain: Chain) =>
  `${chain.id}-outputCurrency-limit`
const QUERY_PARAM_INPUT_CURRENCY_KEY = 'inputCurrency'
const QUERY_PARAM_OUTPUT_CURRENCY_KEY = 'outputCurrency'

const getCurrencyAddress = (chain: Chain) => {
  const params = new URLSearchParams(window.location.search)
  const queryParamInputCurrencyAddress = params.get(
    QUERY_PARAM_INPUT_CURRENCY_KEY,
  )
  const queryParamOutputCurrencyAddress = params.get(
    QUERY_PARAM_OUTPUT_CURRENCY_KEY,
  )
  const localStorageInputCurrencyAddress = localStorage.getItem(
    LOCAL_STORAGE_INPUT_CURRENCY_KEY(chain),
  )
  const localStorageOutputCurrencyAddress = localStorage.getItem(
    LOCAL_STORAGE_OUTPUT_CURRENCY_KEY(chain),
  )
  const inputCurrencyAddress =
    queryParamInputCurrencyAddress ||
    localStorageInputCurrencyAddress ||
    undefined
  const outputCurrencyAddress =
    queryParamOutputCurrencyAddress ||
    localStorageOutputCurrencyAddress ||
    undefined
  return {
    inputCurrencyAddress,
    outputCurrencyAddress,
  }
}

export const LimitProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { data: balance } = useBalance({ address: userAddress, watch: true })
  const { markets, selectedMarket, setSelectedMarket } = useMarketContext()
  const { selectedChain } = useChainContext()

  const [isBid, setIsBid] = useState(true)
  const [selectMode, setSelectMode] = useState<'none' | 'settings'>('none')

  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [inputCurrency, _setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')

  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [outputCurrency, _setOutputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [outputCurrencyAmount, setOutputCurrencyAmount] = useState('')
  const [claimBounty, setClaimBounty] = useState(
    formatUnits(
      selectedChain.defaultGasPrice,
      selectedChain.nativeCurrency.decimals,
    ),
  )
  const [isPostOnly, setIsPostOnly] = useState(false)
  const [selectedDecimalPlaces, setSelectedDecimalPlaces] = useState<
    Decimals | undefined
  >(undefined)
  const [priceInput, setPriceInput] = useState('')
  const { inputCurrencyAddress, outputCurrencyAddress } =
    getCurrencyAddress(selectedChain)
  const [mounted, setMounted] = useState(false)

  const { data: _currencies } = useQuery(
    [
      'limit-currencies',
      selectedChain,
      inputCurrencyAddress,
      outputCurrencyAddress,
    ],
    async () => {
      const _inputCurrency = inputCurrencyAddress
        ? await fetchCurrency(
            selectedChain.id,
            getAddress(inputCurrencyAddress),
          )
        : undefined
      const _outputCurrency = outputCurrencyAddress
        ? await fetchCurrency(
            selectedChain.id,
            getAddress(outputCurrencyAddress),
          )
        : undefined
      return [...WHITELISTED_CURRENCIES[selectedChain.id]]
        .concat(
          _inputCurrency ? [_inputCurrency] : [],
          _outputCurrency ? [_outputCurrency] : [],
        )
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
        )
    },
    {
      initialData: WHITELISTED_CURRENCIES[selectedChain.id],
    },
  ) as {
    data: Currency[]
  }
  const [currencies, setCurrencies] = useState<Currency[]>(_currencies ?? [])

  const { data: balances } = useQuery(
    [
      'limit-balances',
      userAddress,
      balance,
      markets,
      selectedChain,
      currencies,
    ],
    async () => {
      if (!userAddress) {
        return {}
      }
      const uniqueCurrencies = [
        ...currencies.map((currency) => currency),
        ...markets.map((market) => market.quote),
        ...markets.map((market) => market.base),
      ]
        .filter(
          (currency, index, self) =>
            self.findIndex((c) =>
              isAddressEqual(c.address, currency.address),
            ) === index,
        )
        .filter((currency) => !isAddressEqual(currency.address, zeroAddress))
      const results = await readContracts({
        contracts: uniqueCurrencies.map((currency) => ({
          address: currency.address,
          abi: ERC20_PERMIT_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        })),
      })
      return results.reduce(
        (acc: {}, { result }, index: number) => {
          const currency = uniqueCurrencies[index]
          return {
            ...acc,
            [getAddress(currency.address)]: result ?? 0n,
          }
        },
        {
          [zeroAddress]: balance?.value ?? 0n,
        },
      )
    },
    {
      refetchInterval: 5 * 1000,
      refetchIntervalInBackground: true,
    },
  ) as {
    data: Balances
  }

  const availableDecimalPlacesGroups = useMemo(() => {
    const availableDecimalPlacesGroups = selectedMarket
      ? (Array.from(Array(4).keys())
          .map((i) => {
            const fallbackPrice = formatPrice(
              MAX_PRICE,
              selectedMarket.quote.decimals,
              selectedMarket.base.decimals,
            )
            const minPrice = Math.min(
              selectedMarket.bids.sort(
                (a, b) => Number(b.tick) - Number(a.tick),
              )[0]?.price ?? fallbackPrice,
              selectedMarket.asks.sort(
                (a, b) => Number(a.tick) - Number(b.tick),
              )[0]?.price ?? fallbackPrice,
            )
            const decimalPlaces = getPriceDecimals(minPrice)
            const label = (10 ** (i - decimalPlaces)).toFixed(
              Math.max(decimalPlaces - i, 0),
            )
            if (new BigNumber(minPrice).gt(label)) {
              return {
                label,
                value: Math.max(decimalPlaces - i, 0),
              }
            }
          })
          .filter((x) => x) as Decimals[])
      : []
    return availableDecimalPlacesGroups.length > 0
      ? availableDecimalPlacesGroups
      : DEFAULT_DECIMAL_PLACES_GROUPS
  }, [selectedMarket])

  const [bids, asks] = useMemo(
    () =>
      selectedMarket && selectedDecimalPlaces
        ? [
            parseDepth(true, selectedMarket, selectedDecimalPlaces),
            parseDepth(false, selectedMarket, selectedDecimalPlaces),
          ]
        : [[], []],
    [selectedDecimalPlaces, selectedMarket],
  )

  const setInputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY(selectedChain),
          currency.address,
        )
      }
      _setInputCurrency(currency)
    },
    [selectedChain],
  )

  const setOutputCurrency = useCallback(
    (currency: Currency | undefined) => {
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY(selectedChain),
          currency.address,
        )
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  useEffect(() => {
    if (!mounted) {
      const inputCurrency = inputCurrencyAddress
        ? currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(inputCurrencyAddress)),
          )
        : undefined
      const outputCurrency = outputCurrencyAddress
        ? currencies.find((currency) =>
            isAddressEqual(currency.address, getAddress(outputCurrencyAddress)),
          )
        : undefined
      setInputCurrency(inputCurrency)
      setOutputCurrency(outputCurrency)
      setMounted(true)
    }
  }, [
    currencies,
    inputCurrencyAddress,
    markets,
    mounted,
    outputCurrencyAddress,
    selectedChain,
    setInputCurrency,
    setOutputCurrency,
    setSelectedMarket,
  ])

  useEffect(() => {
    if (inputCurrency && outputCurrency) {
      const market = markets.find(
        (m) =>
          m.id ===
          getMarketId(selectedChain.id, [
            inputCurrency.address,
            outputCurrency.address,
          ]).marketId,
      )
      if (market?.id !== selectedMarket?.id) {
        setSelectedMarket(market)
      }
      const { quote, base } = getMarketId(selectedChain.id, [
        inputCurrency.address,
        outputCurrency.address,
      ])
      if (isAddressEqual(quote, inputCurrency.address)) {
        setIsBid(true)
      } else if (isAddressEqual(base, inputCurrency.address)) {
        setIsBid(false)
      } else {
        setIsBid(true)
      }
    } else {
      setIsBid(true)
    }
  }, [
    inputCurrency,
    markets,
    outputCurrency,
    selectedChain.id,
    setSelectedMarket,
  ])

  return (
    <Context.Provider
      value={{
        balances: balances ?? {},
        currencies,
        setCurrencies,
        isBid,
        setIsBid,
        selectMode,
        setSelectMode,
        showInputCurrencySelect,
        setShowInputCurrencySelect,
        inputCurrency,
        setInputCurrency,
        inputCurrencyAmount,
        setInputCurrencyAmount,
        showOutputCurrencySelect,
        setShowOutputCurrencySelect,
        outputCurrency,
        setOutputCurrency,
        outputCurrencyAmount,
        setOutputCurrencyAmount,
        claimBounty,
        setClaimBounty,
        isPostOnly,
        setIsPostOnly,
        selectedDecimalPlaces,
        setSelectedDecimalPlaces,
        priceInput,
        setPriceInput,
        availableDecimalPlacesGroups,
        bids,
        asks,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useLimitContext = () => React.useContext(Context) as LimitContext
