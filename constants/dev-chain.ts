import { Chain } from 'wagmi'

export const beraTestnetChain: Chain = {
  id: 80085,
  name: 'Berachain Artio',
  network: 'bera',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: {
      http: ['https://artio.rpc.berachain.com'],
    },
    public: {
      http: ['https://artio.rpc.berachain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://artio.beratrail.io',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x5a5E58992AadA8770d3220f0af7c39c8476f7A1d',
      blockCreated: 420880,
    },
  },
}
