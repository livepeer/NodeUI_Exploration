import { useEffect, useRef } from 'react'
import { NODE_TYPE_DEFS } from '../nodeTypeDefs'
import type { NodeTypeDef } from '../nodeTypeDefs'
import './AddNodeModal.css'

const STATUS_COLORS = {
  green: '#4ade80',
  orange: '#fb923c',
  gray: '#3d3d3d',
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

interface Props {
  onAdd: (def: NodeTypeDef) => void
  onClose: () => void
}

export default function AddNodeModal({ onAdd, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="add-node-modal-backdrop"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="add-node-modal">
        <div className="add-node-modal__header">
          <span className="add-node-modal__title">Add Node</span>
          <button className="add-node-modal__close" onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="add-node-modal__grid">
          {NODE_TYPE_DEFS.map((def) => (
            <button
              key={def.typeId}
              className="node-type-card"
              onClick={() => { onAdd(def); onClose() }}
            >
              <div className="node-type-card__header">
                <span
                  className="node-type-card__dot"
                  style={{ background: STATUS_COLORS[def.status] }}
                />
                <span className="node-type-card__name">{def.title}</span>
              </div>
              <p className="node-type-card__desc">{def.description}</p>
              <span className="node-type-card__fields">
                {def.fields.length} field{def.fields.length !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
