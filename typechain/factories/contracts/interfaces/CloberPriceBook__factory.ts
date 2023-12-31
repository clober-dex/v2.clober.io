/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CloberPriceBook,
  CloberPriceBookInterface,
} from "../../../contracts/interfaces/CloberPriceBook";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint16",
        name: "priceIndex",
        type: "uint16",
      },
    ],
    name: "indexToPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxPriceIndex",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "roundingUp",
        type: "bool",
      },
    ],
    name: "priceToIndex",
    outputs: [
      {
        internalType: "uint16",
        name: "index",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "correctedPrice",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceUpperBound",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class CloberPriceBook__factory {
  static readonly abi = _abi;
  static createInterface(): CloberPriceBookInterface {
    return new utils.Interface(_abi) as CloberPriceBookInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CloberPriceBook {
    return new Contract(address, _abi, signerOrProvider) as CloberPriceBook;
  }
}
