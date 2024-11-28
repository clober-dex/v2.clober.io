import { zeroAddress } from 'viem'

import { Currency } from '../../model/currency'

export const MITOSIS_WHITELISTED_CURRENCIES: Currency[] = [
  {
    address: '0x40312A325Ac36555beFD4Af5F51994aA13abeAad',
    name: 'Lombard BTC',
    symbol: 'LBTC',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  {
    address: '0xD690E4eC10E733B693dd2a1758b177dC441cB22D',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  {
    address: '0x1f9a9CC05842aa121b9B4b762c6d7006e17DF0a8',
    name: 'EtherFi Wrapped eETH',
    symbol: 'weETH',
    decimals: 18,
  },
  {
    address: '0x9Ffe56678fE032Cb7b623FbfeDe030e426fE63D5',
    name: 'Renzo ETH',
    symbol: 'ezETH',
    decimals: 18,
  },
  {
    address: '0x229A9B0b813231C2B4a97245a73DCA76b1c8f611',
    name: 'Mantle ETH',
    symbol: 'mETH',
    decimals: 18,
  },
  {
    address: '0xCB0CedF61be0Bf4d5F6596b8ab296614b154db91',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  },
  {
    address: '0xb8f230Ea91516787F2cbB2c63b147Ec79988E3ED',
    name: 'Ethena USD',
    symbol: 'USDe',
    decimals: 18,
  },
  {
    address: '0xB2F19Cf127A86Cb285f980d79f1594762763695A',
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
  },
  {
    address: '0x4ac5b9807f3B0Eae9B7078De0f05D7D121CBEB0a',
    name: 'Optimism',
    symbol: 'OP',
    decimals: 18,
  },
  {
    address: '0x12E08f9DE0F2286c92B263F9854A2A78957948fc',
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
  },
  {
    address: '0xA0e87A81965F7bEbd45d877038A26Afc6670EcB2',
    name: 'AAVE',
    symbol: 'AAVE',
    decimals: 18,
  },
  {
    address: '0x09Ea3eC040aE3b2414C9a1D118728aBBFE2626Cd',
    name: 'Compound',
    symbol: 'COMP',
    decimals: 18,
  },
  {
    address: '0x6A85b98758d859539BA585a07F6ae4223C9B83ab',
    name: 'Stargate',
    symbol: 'STG',
    decimals: 18,
  },
  {
    address: '0xCf010Ed822D51550b79Eeb791a3D7679EaBdb25d',
    name: 'Pendle',
    symbol: 'PENDLE',
    decimals: 18,
  },
  {
    address: '0x20F8826d7975a1b0b14bdd66D538F2f4ef5f21fd',
    name: 'Yearn Finance',
    symbol: 'YFI',
    decimals: 18,
  },

  //
  {
    address: zeroAddress,
    name: 'Mitosis Token',
    symbol: 'MITO',
    decimals: 18,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
  },
  {
    name: 'Wrapped MITO',
    symbol: 'WMITO',
    decimals: 18,
    icon: 'https://avatars.githubusercontent.com/u/150423703',
    address: '0x8B71fD76b23721d0D73CA14Ea6464AAD70149B67',
  },
]
