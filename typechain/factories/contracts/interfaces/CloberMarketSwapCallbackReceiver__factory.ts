/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CloberMarketSwapCallbackReceiver,
  CloberMarketSwapCallbackReceiverInterface,
} from "../../../contracts/interfaces/CloberMarketSwapCallbackReceiver";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "inputToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "outputToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "inputAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "outputAmount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "cloberMarketSwapCallback",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class CloberMarketSwapCallbackReceiver__factory {
  static readonly abi = _abi;
  static createInterface(): CloberMarketSwapCallbackReceiverInterface {
    return new utils.Interface(
      _abi
    ) as CloberMarketSwapCallbackReceiverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CloberMarketSwapCallbackReceiver {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CloberMarketSwapCallbackReceiver;
  }
}