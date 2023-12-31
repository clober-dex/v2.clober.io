/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ArithmeticPriceBook,
  ArithmeticPriceBookInterface,
} from "../../contracts/ArithmeticPriceBook";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint128",
        name: "a",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "d",
        type: "uint128",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "errorCode",
        type: "uint256",
      },
    ],
    name: "CloberError",
    type: "error",
  },
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

const _bytecode =
  "0x61010060405234801561001157600080fd5b506040516106cd3803806106cd833981016040819052610030916100ba565b6001600160801b03808316608052811660a05261ffff60c0819052610056908290610103565b610060908361012e565b6001600160801b0390811660e052811660000361009757604051630e92930560e11b8152600d600482015260240160405180910390fd5b5050610155565b80516001600160801b03811681146100b557600080fd5b919050565b600080604083850312156100cd57600080fd5b6100d68361009e565b91506100e46020840161009e565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b6001600160801b03818116838216028082169190828114610126576101266100ed565b505092915050565b6001600160801b0381811683821601908082111561014e5761014e6100ed565b5092915050565b60805160a05160c05160e0516105026101cb600039600060e30152600060a901526000818161013f015281816101c60152818161023b015281816102e4015261035001526000818161010a0152818161016d015281816101f0015281816102650152818161030e015261037a01526105026000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063523fdc71146100515780636a204d0c146100835780637242ec1d146100a4578063b9728219146100de575b600080fd5b61006461005f3660046103ad565b610105565b6040805161ffff90931683526020830191909152015b60405180910390f35b6100966100913660046103e2565b610344565b60405190815260200161007a565b6100cb7f000000000000000000000000000000000000000000000000000000000000000081565b60405161ffff909116815260200161007a565b6100967f000000000000000000000000000000000000000000000000000000000000000081565b6000807f00000000000000000000000000000000000000000000000000000000000000006001600160801b031684108061019e57506101677f000000000000000000000000000000000000000000000000000000000000000062010000610423565b610191907f000000000000000000000000000000000000000000000000000000000000000061044e565b6001600160801b03168410155b156101c457604051630e92930560e11b8152601060048201526024015b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160801b03167f00000000000000000000000000000000000000000000000000000000000000006001600160801b0316856102239190610475565b61022d91906104a4565b91508280156102a4575060007f00000000000000000000000000000000000000000000000000000000000000006001600160801b03167f00000000000000000000000000000000000000000000000000000000000000006001600160801b0316866102989190610475565b6102a291906104b8565b115b156102da5761fffe1961ffff8316016102d357604051630e92930560e11b8152601060048201526024016101bb565b6001820191505b61030861ffff83167f0000000000000000000000000000000000000000000000000000000000000000610423565b610332907f000000000000000000000000000000000000000000000000000000000000000061044e565b6001600160801b031690509250929050565b600061037461ffff83167f0000000000000000000000000000000000000000000000000000000000000000610423565b61039e907f000000000000000000000000000000000000000000000000000000000000000061044e565b6001600160801b031692915050565b600080604083850312156103c057600080fd5b82359150602083013580151581146103d757600080fd5b809150509250929050565b6000602082840312156103f457600080fd5b813561ffff8116811461040657600080fd5b9392505050565b634e487b7160e01b600052601160045260246000fd5b6001600160801b038181168382160280821691908281146104465761044661040d565b505092915050565b6001600160801b0381811683821601908082111561046e5761046e61040d565b5092915050565b818103818111156104885761048861040d565b92915050565b634e487b7160e01b600052601260045260246000fd5b6000826104b3576104b361048e565b500490565b6000826104c7576104c761048e565b50069056fea26469706673582212206f3b3a59967b64c14a6009774423d677914350a60e22a2e49acd3942079b1e8b64736f6c63430008110033";

type ArithmeticPriceBookConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ArithmeticPriceBookConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ArithmeticPriceBook__factory extends ContractFactory {
  constructor(...args: ArithmeticPriceBookConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    a: BigNumberish,
    d: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ArithmeticPriceBook> {
    return super.deploy(a, d, overrides || {}) as Promise<ArithmeticPriceBook>;
  }
  override getDeployTransaction(
    a: BigNumberish,
    d: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(a, d, overrides || {});
  }
  override attach(address: string): ArithmeticPriceBook {
    return super.attach(address) as ArithmeticPriceBook;
  }
  override connect(signer: Signer): ArithmeticPriceBook__factory {
    return super.connect(signer) as ArithmeticPriceBook__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ArithmeticPriceBookInterface {
    return new utils.Interface(_abi) as ArithmeticPriceBookInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ArithmeticPriceBook {
    return new Contract(address, _abi, signerOrProvider) as ArithmeticPriceBook;
  }
}
