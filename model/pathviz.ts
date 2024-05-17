export type PathViz = {
  nodes: {
    name: string
    symbol: string
    decimals: number
    visible: boolean
    width: number
    icon?: string
  }[]
  links: {
    source: number
    target: number
    sourceExtend: boolean
    targetExtend: boolean
    sourceToken: {
      name: string
      symbol: string
      decimals: number
    }
    targetToken: {
      name: string
      symbol: string
      decimals: number
    }
    label: string
    value: number
    nextValue: number
    stepValue: number
    in_value: number
    out_value: number
    edge_len: number
  }[]
}
