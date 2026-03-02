import { useState } from 'react'
import type { Node } from 'reactflow'
import type { PipelineNodeData } from './PipelineNode'
import { STATUS_COLORS } from './PipelineNode'
import ColorWheel from './ColorWheel'
import './NodeEditSidebar.css'

interface Props {
  nodeId: string | null
  nodes: Node<PipelineNodeData>[]
  onClose: () => void
  onUpdateNode: (id: string, updater: (data: PipelineNodeData) => PipelineNodeData) => void
}

export default function NodeEditSidebar({ nodeId, nodes, onClose, onUpdateNode }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(true)

  const node = nodeId ? nodes.find((n) => n.id === nodeId) : null
  const data = node?.data

  if (!nodeId || !data) return null

  const dotColor = data.statusColor ?? STATUS_COLORS[data.status]

  return (
    <aside className="edit-sidebar edit-sidebar--open">
      {/* Header */}
      <div className="edit-sidebar__header">
        <input
          className="edit-sidebar__title"
          value={data.title}
          onChange={(e) =>
            onUpdateNode(nodeId, (d) => ({ ...d, title: e.target.value }))
          }
        />
        <button className="edit-sidebar__close" title="Close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      {/* Status color row */}
      <div className="edit-sidebar__color-row">
        <span className="edit-sidebar__color-label">Status Color</span>
        <div className="edit-sidebar__color-wrapper">
          <button
            className="edit-sidebar__color-btn"
            style={{ background: dotColor }}
            title="Change color"
            onClick={() => setShowColorPicker((v) => !v)}
          />
          {showColorPicker && (
            <div className="edit-sidebar__color-popover">
              <ColorWheel
                color={dotColor}
                onChange={(c) => onUpdateNode(nodeId, (d) => ({ ...d, statusColor: c }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Properties section */}
      <div className="edit-sidebar__section">
        <button
          className="edit-sidebar__section-header"
          onClick={() => setPropertiesOpen((v) => !v)}
        >
          <span>Properties</span>
          <ChevronIcon open={propertiesOpen} />
        </button>

        {propertiesOpen && (
          <div className="edit-sidebar__fields">
            {data.fields.map((field, idx) => (
              <div key={field.id} className="edit-sidebar__field">
                <label className="edit-sidebar__field-label">{field.label}</label>
                {field.textarea ? (
                  <textarea
                    className="edit-sidebar__field-textarea"
                    value={field.value}
                    onChange={(e) =>
                      onUpdateNode(nodeId, (d) => ({
                        ...d,
                        fields: d.fields.map((f, i) =>
                          i === idx ? { ...f, value: e.target.value } : f
                        ),
                      }))
                    }
                  />
                ) : (
                  <input
                    className="edit-sidebar__field-input"
                    value={field.value}
                    onChange={(e) =>
                      onUpdateNode(nodeId, (d) => ({
                        ...d,
                        fields: d.fields.map((f, i) =>
                          i === idx ? { ...f, value: e.target.value } : f
                        ),
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12" height="12" viewBox="0 0 12 12" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
  >
    <path d="M2 4l4 4 4-4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
