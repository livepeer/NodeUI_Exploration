import { memo, useCallback } from 'react'
import { Handle, Position, NodeToolbar, useStore } from 'reactflow'
import type { NodeProps } from 'reactflow'
import './PipelineNode.css'

export interface FieldDef {
  id: string
  label: string
  value: string
  textarea?: boolean
}

export interface PipelineNodeData {
  title: string
  status: 'green' | 'orange' | 'gray'
  fields: FieldDef[]
  connectedHandles?: string[]
}

const STATUS_COLORS: Record<PipelineNodeData['status'], string> = {
  green: '#4ade80',
  orange: '#fb923c',
  gray: '#3d3d3d',
}

const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="3" r="1.2" fill="#888" />
    <circle cx="7" cy="7" r="1.2" fill="#888" />
    <circle cx="7" cy="11" r="1.2" fill="#888" />
  </svg>
)

// Context toolbar icons
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 4h9M5.5 4V3a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4 4l.7 7h4.6L10 4" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="#888" strokeWidth="1.2" />
    <path d="M7 6.5v4M7 4.5v.5" stroke="#888" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const StatusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="4" fill="#4ade80" />
  </svg>
)

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="2" width="4" height="4" rx="0.5" stroke="#888" strokeWidth="1.2" />
    <rect x="8" y="2" width="4" height="4" rx="0.5" stroke="#888" strokeWidth="1.2" />
    <rect x="2" y="8" width="4" height="4" rx="0.5" stroke="#888" strokeWidth="1.2" />
    <rect x="8" y="8" width="4" height="4" rx="0.5" stroke="#888" strokeWidth="1.2" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 11L11 3M11 3H6M11 3v5" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 3L11 5L5 11H3V9L9 3Z" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function PipelineNode({ data, selected }: NodeProps<PipelineNodeData>) {
  const edges = useStore((s) => s.edges)

  const isHandleConnected = useCallback(
    (handleId: string) => {
      return edges.some(
        (e) => e.sourceHandle === handleId || e.targetHandle === handleId
      )
    },
    [edges]
  )

  return (
    <>
      {/* Context toolbar shown when node is selected */}
      <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
        <div className="node-toolbar">
          <button className="toolbar-btn" title="Delete">
            <TrashIcon />
          </button>
          <button className="toolbar-btn" title="Info">
            <InfoIcon />
          </button>
          <button className="toolbar-btn" title="Status">
            <StatusIcon />
          </button>
          <button className="toolbar-btn" title="Grid">
            <GridIcon />
          </button>
          <button className="toolbar-btn" title="Open">
            <ArrowIcon />
          </button>
          <button className="toolbar-btn" title="Edit">
            <PenIcon />
          </button>
        </div>
      </NodeToolbar>

      <div className={`pipeline-node${selected ? ' pipeline-node--selected' : ''}`}>
        <div className="pipeline-node__header">
          <span
            className="pipeline-node__status"
            style={{ background: STATUS_COLORS[data.status] }}
          />
          <span className="pipeline-node__title">{data.title}</span>
          <button className="pipeline-node__more">
            <MoreIcon />
          </button>
        </div>

        <div className="pipeline-node__body">
          {data.fields.map((field) => {
            const inputHandleId = `${field.id}-in`
            const outputHandleId = `${field.id}-out`
            const inputConnected = isHandleConnected(inputHandleId)
            const outputConnected = isHandleConnected(outputHandleId)

            return (
              <div
                key={field.id}
                className={`pipeline-node__field${inputConnected || outputConnected ? ' pipeline-node__field--connected' : ''}`}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={inputHandleId}
                  className={`pipeline-node__handle pipeline-node__handle--input${inputConnected ? ' pipeline-node__handle--connected' : ''}`}
                />

                {field.textarea ? (
                  <div className="pipeline-node__textarea-wrapper">
                    <span className="pipeline-node__field-label">{field.label}</span>
                    <div className="pipeline-node__textarea">
                      <span className="pipeline-node__textarea-placeholder">{field.value}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="pipeline-node__field-label">{field.label}</span>
                    <span className="pipeline-node__field-value">{field.value}</span>
                  </>
                )}

                <Handle
                  type="source"
                  position={Position.Right}
                  id={outputHandleId}
                  className={`pipeline-node__handle pipeline-node__handle--output${outputConnected ? ' pipeline-node__handle--connected' : ''}`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default memo(PipelineNode)
