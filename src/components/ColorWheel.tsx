import { useState, useRef, useEffect, useCallback } from 'react'
import './ColorWheel.css'

// ── Color math ───────────────────────────────────────────────────────────────

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100; s /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').padEnd(6, '0')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

// ── Constants ────────────────────────────────────────────────────────────────

const WHEEL_SIZE = 116
const RING_THICKNESS = 18
const MID_R = WHEEL_SIZE / 2 - RING_THICKNESS / 2

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  color: string
  onChange: (color: string) => void
}

export default function ColorWheel({ color, onChange }: Props) {
  const [hue, sat, lit] = hexToHsl(color)
  // Clamp lightness into a useful vivid range; preserve if already vivid
  const [localL, setLocalL] = useState(() => (lit < 20 || lit > 80 || sat < 20) ? 55 : lit)

  const wheelRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const localLRef = useRef(localL)
  useEffect(() => { localLRef.current = localL }, [localL])

  // Sync lightness when parent changes color
  useEffect(() => {
    const [, s, l] = hexToHsl(color)
    if (s > 20 && l >= 20 && l <= 80) setLocalL(l)
  }, [color])

  const pickFromXY = useCallback((clientX: number, clientY: number) => {
    const el = wheelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
    const newHue = ((angle + 90) + 360) % 360
    onChange(hslToHex(newHue, 80, localLRef.current))
  }, [onChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    pickFromXY(e.clientX, e.clientY)
  }, [pickFromXY])

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) pickFromXY(e.clientX, e.clientY) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [pickFromXY])

  const mathAngle = (hue - 90) * (Math.PI / 180)
  const indX = WHEEL_SIZE / 2 + MID_R * Math.cos(mathAngle)
  const indY = WHEEL_SIZE / 2 + MID_R * Math.sin(mathAngle)
  const displayColor = hslToHex(hue, 80, localL)

  return (
    <div className="color-wheel" onClick={(e) => e.stopPropagation()}>
      {/* Hue ring */}
      <div
        ref={wheelRef}
        className="color-wheel__ring"
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
        onMouseDown={handleMouseDown}
      >
        {/* Centre cutout to make it a ring */}
        <div
          className="color-wheel__cutout"
          style={{
            width: WHEEL_SIZE - RING_THICKNESS * 2,
            height: WHEEL_SIZE - RING_THICKNESS * 2,
            top: RING_THICKNESS,
            left: RING_THICKNESS,
          }}
        />
        {/* Hue indicator */}
        <div
          className="color-wheel__indicator"
          style={{ left: indX - 5, top: indY - 5, background: displayColor }}
        />
      </div>

      {/* Lightness track + slider */}
      <div className="color-wheel__lightness">
        <div
          className="color-wheel__lightness-track"
          style={{
            background: `linear-gradient(to right,
              hsl(${hue}, 80%, 15%),
              hsl(${hue}, 80%, 50%),
              hsl(${hue}, 80%, 85%))`,
          }}
        />
        <input
          type="range"
          min={15}
          max={85}
          value={localL}
          className="color-wheel__lightness-input"
          onChange={(e) => {
            const v = Number(e.target.value)
            setLocalL(v)
            onChange(hslToHex(hue, 80, v))
          }}
        />
      </div>

      {/* Preview + hex */}
      <div className="color-wheel__footer">
        <div className="color-wheel__preview" style={{ background: displayColor }} />
        <span className="color-wheel__hex">{displayColor.toUpperCase()}</span>
      </div>
    </div>
  )
}
