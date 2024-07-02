import React, { useEffect, useState } from 'react'
import ReactFlow, {
  BaseEdge,
  getSimpleBezierPath,
  Handle,
  Node as NodeType,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/base.css'
import { zeroAddress } from 'viem'

import { PathViz } from '../model/pathviz'
import { toPlacesString } from '../utils/bignumber'

import { CurrencyIcon } from './icon/currency-icon'

const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 7) - hash)
  }
  let color = ''
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }
  return '#' + color
}

export default function PathVizViewer({
  pathVizData,
}: {
  pathVizData?: PathViz
}) {
  return pathVizData ? (
    <ReactFlowProvider>
      <_PathViz
        pathVizData={{
          nodes: pathVizData.nodes,
          links: pathVizData.links
            .reduce(
              (acc, link) => {
                const existingLink = acc.find(
                  (l) =>
                    l.source === link.source &&
                    l.target === link.target &&
                    l.label === link.label,
                )
                if (existingLink) {
                  existingLink.in_value = existingLink.in_value + link.in_value
                  existingLink.out_value =
                    existingLink.out_value + link.out_value
                  existingLink.nextValue =
                    existingLink.nextValue + link.nextValue
                  existingLink.stepValue =
                    existingLink.stepValue + link.stepValue
                  existingLink.value = existingLink.value + link.value
                } else {
                  acc.push(link)
                }
                return acc
              },
              [] as PathViz['links'],
            )
            .sort((a, b) =>
              a.source === b.source ? a.target - b.target : a.source - b.source,
            ),
        }}
      />
    </ReactFlowProvider>
  ) : (
    <div
      className={`flex flex-col bg-gray-900 overflow-hidden rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[600px]`}
    ></div>
  )
}

const _PathViz = ({ pathVizData }: { pathVizData: PathViz }) => {
  const instance = useReactFlow()

  const [hoveredNode, setHoveredNode] = useState<null | NodeType>(null)
  const numberOfEdge: { [key: string]: number } =
    pathVizData.links.reduce(
      (acc, l) => {
        acc[`${l.source}-${l.target}`] = pathVizData.links.filter(
          (ll) => ll.target === l.target && ll.source === l.source,
        ).length
        return acc
      },
      {} as { [key: string]: number },
    ) ?? ({} as { [key: string]: number })
  const dexNames: { [key: string]: string[] } = pathVizData.links.reduce(
    (acc, l) => {
      const key = `${l.source}-${l.target}`
      if (acc[key]) {
        acc[key].push(l.label)
      } else {
        acc[key] = [l.label]
      }
      return acc
    },
    {} as { [key: string]: string[] },
  )

  useEffect(() => {
    setTimeout(() => {
      instance.fitView({})
    }, 0)
  }, [instance, pathVizData])

  const nodes = pathVizData.nodes.map((n, i) => {
    const id = i.toString()
    return {
      id,
      type: 'custom',
      position: {
        x: 0,
        y: 0,
      },
      data: {
        ...n,
        id,
        sourceConnected: pathVizData.links.filter((l) => l.source === i),
        targetConnected: pathVizData.links.filter((l) => l.target === i),
        targetHandle: i != 0,
        sourceHandle: i != pathVizData.nodes.length - 1,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      rawData: n,
    }
  })

  const edges = pathVizData.links.map((l, i) => {
    nodes[l.target].position.x = nodes[l.source].position.x + 150

    return {
      data: l,
      type: 'custom',
      label: '',
      id: i.toString(),
      source: l.source.toString(),
      target: l.target.toString(),
      focusable: false,
      animated: true,
      rawData: l,
    }
  })

  nodes.forEach((n) => {
    nodes
      .filter((nn) => nn.position.x === n.position.x)
      .sort((a, b) => {
        const aa = edges
          .filter((l) => l.target === a.id)
          .reduce((c, v) => (c += v.rawData.value), 0)
        const bb = edges
          .filter((l) => l.target === b.id)
          .reduce((c, v) => (c += v.rawData.value), 0)
        return bb - aa
      })
      .forEach((nn, i) => {
        nn.position.y = i * 50
      })
  })

  const Edge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    target,
    source,
  }: {
    id: string
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
    target: number
    source: number
  }) => {
    const length = numberOfEdge[`${source}-${target}`]
    return (
      <>
        {Array.from({ length }).map((_, i) => (
          <BaseEdge
            style={{
              stroke: stringToColor(dexNames[`${source}-${target}`][i]),
            }}
            key={`${id}-${i}`}
            id={id}
            path={
              getSimpleBezierPath({
                sourceX,
                sourceY: sourceY + (i - Math.floor(length / 2)) * (18 / length),
                targetX,
                targetY,
              })[0]
            }
          />
        ))}
      </>
    )
  }

  const Node = ({
    data: { id, symbol, icon, targetConnected, targetHandle, sourceHandle },
  }: {
    data: {
      id: string
      symbol: string
      icon?: string
      targetConnected: {
        label: string
        in_value: string
        out_value: string
        sourceToken: { symbol: string }
        targetToken: { symbol: string }
      }[]
      targetHandle: boolean
      sourceHandle: boolean
    }
  }) => {
    return (
      <div
        className="flex items-center p-1 lg:px-2 bg-gray-700 rounded-full gap-2"
        data-tooltip-id={id}
      >
        <div className="flex items-center rounded-full gap-2">
          <CurrencyIcon
            currency={{
              symbol,
              decimals: 18,
              address: zeroAddress,
              name: '',
              icon,
            }}
            className="rounded-full w-5 h-5"
          />
          <div
            className="text-sm text-white hidden lg:flex w-12"
            style={{
              transform: `scale(${1 - (symbol.length - 4) / 10})`,
              transformOrigin: 'left',
            }}
          >
            {symbol}
          </div>
        </div>

        <div className="absolute top-full left-2 right-2 mt-0.5 flex flex-wrap items-center gap-0.5">
          {targetConnected.map((x, i) => (
            <div
              key={`${i}`}
              className="w-1 h-1 rounded-full"
              style={{ background: stringToColor(x.label) }}
            />
          ))}
        </div>
        {targetHandle && <Handle type="target" position={Position.Left} />}
        {sourceHandle && <Handle type="source" position={Position.Right} />}
      </div>
    )
  }

  const uniqueSourceSymbols =
    hoveredNode &&
    nodes[parseInt(hoveredNode.id)]?.data.targetConnected.length > 0
      ? nodes[parseInt(hoveredNode.id)].data.targetConnected
          .map((x) => x.sourceToken.symbol)
          .filter((v, i, a) => a.indexOf(v) === i)
      : []

  return (
    <div
      className={`flex flex-col bg-gray-900 overflow-hidden rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[600px]`}
    >
      <ReactFlow
        nodeTypes={{
          custom: Node,
        }}
        edgeTypes={{
          // @ts-ignore
          custom: Edge,
        }}
        nodes={nodes}
        edges={edges}
        onNodeMouseEnter={(e, n) => {
          setHoveredNode(n)
        }}
        onNodeMouseLeave={() => {
          setHoveredNode(null)
        }}
        fitView
      >
        {hoveredNode &&
          !(
            uniqueSourceSymbols.length === 1 &&
            uniqueSourceSymbols[0] ===
              nodes[parseInt(hoveredNode.id)].data.symbol
          ) &&
          nodes[parseInt(hoveredNode.id)]?.data.targetConnected.length > 0 && (
            <div className="absolute left-0 top-0 p-3 z-50 bg-gray-950 bg-opacity-90 overflow-hidden rounded-br-xl pointer-events-none">
              <div className="flex flex-col gap-2">
                {nodes[parseInt(hoveredNode.id)].data.targetConnected.map(
                  (x, i) => {
                    return (
                      <div key={`${i}`} className="text-xs text-white">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: stringToColor(x.label) }}
                          />
                          <span className="flex items-center ">{x.label}</span>
                        </div>

                        <div className="flex items-center gap-1 pl-3 mt-0.5">
                          <span>
                            {toPlacesString(x.in_value)} ({x.sourceToken.symbol}
                            )
                          </span>
                          <svg
                            className="flex-shrink-0"
                            width="8"
                            viewBox="0 0 12 14"
                            fill="none"
                          >
                            <path
                              d="M4 2L9 7L4 12"
                              stroke="#fff"
                              strokeWidth="1.5"
                              strokeLinecap="square"
                            />
                          </svg>
                          <span>
                            {toPlacesString(x.out_value)} (
                            {x.targetToken.symbol})
                          </span>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
            </div>
          )}
      </ReactFlow>
      <div className="absolute hidden bottom-2 lg:grid grid-cols-3 text-white text-xs">
        {Object.values(dexNames)
          .reduce((acc, v) => {
            return acc.concat(v)
          }, [])
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((v, i) => (
            <div key={i} className="flex items-center gap-2 pr-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stringToColor(v) }}
              />
              {v}
            </div>
          ))}
      </div>
    </div>
  )
}
