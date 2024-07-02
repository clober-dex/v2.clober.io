import React, { useEffect, useState } from 'react'
import ReactFlow, {
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
  return (
    <ReactFlowProvider>
      <_PathViz pathVizData={pathVizData} />
    </ReactFlowProvider>
  )
}

const _PathViz = ({ pathVizData }: { pathVizData?: PathViz }) => {
  const instance = useReactFlow()

  const [hoveredNode, setHoveredNode] = useState<null | NodeType>(null)

  useEffect(() => {
    setTimeout(() => {
      instance.fitView({})
    }, 0)
  }, [instance, pathVizData])

  if (!pathVizData || !pathVizData.nodes) {
    return (
      <div
        className={`flex flex-col bg-gray-900 overflow-hidden rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[504px]`}
      ></div>
    )
  }

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

  return (
    <div
      className={`flex flex-col bg-gray-900 overflow-hidden rounded-2xl min-h-[280px] w-full md:w-[480px] lg:w-[504px]`}
    >
      <ReactFlow
        nodeTypes={nodeTypes}
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
    </div>
  )
}

const Node = ({
  data: { id, symbol, icon, targetConnected, targetHandle, sourceHandle },
}: {
  data: {
    id: string
    symbol: string
    icon?: string
    targetConnected: { label: string; in_value: string; out_value: string }[]
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

const nodeTypes = {
  custom: Node,
}
