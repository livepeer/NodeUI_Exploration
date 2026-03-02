import { memo, useCallback, useRef, useEffect, useState, useContext } from 'react'
import { Handle, Position, NodeToolbar, useStore, useReactFlow } from 'reactflow'
import type { NodeProps } from 'reactflow'
import ColorWheel from './ColorWheel'
import { EditSidebarContext } from '../EditSidebarContext'
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
  /** Custom hex color — overrides status when set */
  statusColor?: string
  fields: FieldDef[]
}

export const STATUS_COLORS: Record<PipelineNodeData['status'], string> = {
  green: '#4ade80',
  orange: '#fb923c',
  gray: '#3d3d3d',
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="3" r="1.2" fill="#888" />
    <circle cx="7" cy="7" r="1.2" fill="#888" />
    <circle cx="7" cy="11" r="1.2" fill="#888" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 4h9M5.5 4V3a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4 4l.7 7h4.6L10 4"
      stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="#888" strokeWidth="1.2" />
    <path d="M7 6.5v4M7 4.5v.5" stroke="#888" strokeWidth="1.4" strokeLinecap="round" />
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

// ── Component ─────────────────────────────────────────────────────────────────

function PipelineNode({ id, data, selected }: NodeProps<PipelineNodeData>) {
  const { deleteElements, setNodes } = useReactFlow()
  const edges = useStore((s) => s.edges)
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const openSidebar = useContext(EditSidebarContext)

  const dotColor = data.statusColor ?? STATUS_COLORS[data.status]

  // Close colour picker when clicking outside
  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    // Slight delay so the same click that opened it doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [showPicker])

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] })
  }, [deleteElements, id])

  const handleColorChange = useCallback((newColor: string) => {
    setNodes((nds) =>
      nds.map((n) => n.id === id ? { ...n, data: { ...n.data, statusColor: newColor } } : n)
    )
  }, [setNodes, id])

  const isHandleConnected = useCallback(
    (handleId: string) =>
      edges.some((e) => e.sourceHandle === handleId || e.targetHandle === handleId),
    [edges]
  )

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
        <div className="node-toolbar">

          {/* Delete node */}
          <button className="toolbar-btn" title="Delete node" onClick={handleDelete}>
            <TrashIcon />
          </button>

          <button className="toolbar-btn" title="Info">
            <InfoIcon />
          </button>

          {/* Colour picker trigger */}
          <div className="toolbar-color-wrapper" ref={pickerRef}>
            <button
              className="toolbar-btn"
              title="Change colour"
              onClick={(e) => { e.stopPropagation(); setShowPicker((v) => !v) }}
            >
              <span className="toolbar-color-dot" style={{ background: dotColor }} />
            </button>

            {showPicker && (
              <div className="color-picker-popover">
                <ColorWheel color={dotColor} onChange={handleColorChange} />
              </div>
            )}
          </div>

          <button className="toolbar-btn" title="Grid">
            <GridIcon />
          </button>
          <button className="toolbar-btn" title="Open">
            <ArrowIcon />
          </button>
          <button className="toolbar-btn" title="Edit" onClick={() => openSidebar?.(id)}>
            <PenIcon />
          </button>

        </div>
      </NodeToolbar>

      {/* Node card — set --dot-color so handles inherit it */}
      <div
        className={`pipeline-node${selected ? ' pipeline-node--selected' : ''}`}
        style={{ '--dot-color': dotColor } as React.CSSProperties}
      >
        <div className="pipeline-node__header">
          <span className="pipeline-node__status" style={{ background: dotColor }} />
          <span className="pipeline-node__title">{data.title}</span>
          <button className="pipeline-node__more">
            <MoreIcon />
          </button>
        </div>

        <div className="pipeline-node__body">
          {data.fields.map((field) => {
            const inputId = `${field.id}-in`
            const outputId = `${field.id}-out`
            const inputConnected = isHandleConnected(inputId)
            const outputConnected = isHandleConnected(outputId)

            return (
              <div
                key={field.id}
                className={`pipeline-node__field${inputConnected || outputConnected ? ' pipeline-node__field--connected' : ''}`}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={inputId}
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
                  id={outputId}
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
