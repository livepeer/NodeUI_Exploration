import { useState } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow, useStore } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import type { PipelineNodeData } from './PipelineNode'
import { STATUS_COLORS } from './PipelineNode'
import './CustomEdge.css'

export default function CustomEdge({
  id,
  source,
  selected,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const [hovered, setHovered] = useState(false)

  // Subscribe directly to the source node's current color so it stays in sync
  const edgeColor = useStore((s) => {
    const node = s.nodeInternals.get(source)
    const data = node?.data as PipelineNodeData | undefined
    return (
      data?.statusColor ??
      (data?.status ? STATUS_COLORS[data.status] : '#4ade80')
    )
  })

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const visible = hovered || selected

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: edgeColor, strokeWidth: 1.5 }} />

      {/* Wide transparent path to make hover easier to trigger */}
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            className={`edge-delete-btn${visible ? ' edge-delete-btn--visible' : ''}`}
            onClick={() => setEdges((eds) => eds.filter((e) => e.id !== id))}
            title="Remove connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
