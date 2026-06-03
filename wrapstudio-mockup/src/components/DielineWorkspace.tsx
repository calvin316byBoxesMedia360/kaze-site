import React, { useRef, useState } from 'react'
import type { MockupState, DecalLayer } from '../App'
import { MockupViewer } from './MockupViewer'

interface Props {
  state: MockupState
  onUpdate: (patch: Partial<MockupState>) => void
  onUpdateLayer: (id: string, patch: Partial<DecalLayer>) => void
}

export function DielineWorkspace({ state, onUpdate, onUpdateLayer }: Props) {
  const [isPipMinimized, setIsPipMinimized] = useState(false)
  const selectedLayer = state.layers.find(l => l.id === state.selectedLayerId) || null

  // Dragging references
  const dragRef = useRef<{
    startX: number
    startY: number
    startOffsetX: number
    startOffsetY: number
    boxWidth: number
    boxHeight: number
  } | null>(null)

  const scaleDragRef = useRef<{
    startX: number
    startY: number
    startScale: number
    centerX: number
    centerY: number
  } | null>(null)

  const rotateDragRef = useRef<{
    centerX: number
    centerY: number
    startAngle: number
    startPointerAngle: number
  } | null>(null)

  // Dragging Decal
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    e.stopPropagation()
    onUpdate({ selectedLayerId: layer.id, activeRegion: layer.region })

    const rect = e.currentTarget.parentElement?.getBoundingClientRect()
    const boxWidth = rect ? rect.width : 250
    const boxHeight = rect ? rect.height : 325

    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: layer.offsetX,
      startOffsetY: layer.offsetY,
      boxWidth,
      boxHeight,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    if (!dragRef.current) return
    e.stopPropagation()

    const { startX, startY, startOffsetX, startOffsetY, boxWidth, boxHeight } = dragRef.current
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    const deltaOffsetX = deltaX / boxWidth
    const deltaOffsetY = -deltaY / boxHeight // screen Y goes down, 3D Y goes up

    onUpdateLayer(layer.id, {
      offsetX: startOffsetX + deltaOffsetX,
      offsetY: startOffsetY + deltaOffsetY,
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    e.stopPropagation()
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {}
    dragRef.current = null
  }

  // Scaling Decal
  const handleScaleStart = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    e.stopPropagation()
    onUpdate({ selectedLayerId: layer.id, activeRegion: layer.region })

    const decalRect = e.currentTarget.parentElement?.getBoundingClientRect()
    if (!decalRect) return
    const centerX = decalRect.left + decalRect.width / 2
    const centerY = decalRect.top + decalRect.height / 2

    e.currentTarget.setPointerCapture(e.pointerId)
    scaleDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: layer.scale,
      centerX,
      centerY
    }
  }

  const handleScaleMove = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    if (!scaleDragRef.current) return
    e.stopPropagation()

    const { centerX, centerY, startScale, startX, startY } = scaleDragRef.current
    const dStart = Math.hypot(startX - centerX, startY - centerY)
    const dCurrent = Math.hypot(e.clientX - centerX, e.clientY - centerY)

    if (dStart > 5) {
      const nextScale = startScale * (dCurrent / dStart)
      onUpdateLayer(layer.id, { scale: Number(nextScale.toFixed(2)) })
    }
  }

  const handleScaleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scaleDragRef.current) return
    e.stopPropagation()
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {}
    scaleDragRef.current = null
  }

  // Rotating Decal
  const handleRotateStart = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    e.stopPropagation()
    onUpdate({ selectedLayerId: layer.id, activeRegion: layer.region })

    const decalRect = e.currentTarget.parentElement?.getBoundingClientRect()
    if (!decalRect) return
    const centerX = decalRect.left + decalRect.width / 2
    const centerY = decalRect.top + decalRect.height / 2

    e.currentTarget.setPointerCapture(e.pointerId)
    const pointerAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)

    rotateDragRef.current = {
      centerX,
      centerY,
      startAngle: layer.rotation,
      startPointerAngle: pointerAngle
    }
  }

  const handleRotateMove = (e: React.PointerEvent<HTMLDivElement>, layer: DecalLayer) => {
    if (!rotateDragRef.current) return
    e.stopPropagation()

    const { centerX, centerY, startAngle, startPointerAngle } = rotateDragRef.current
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)

    const deltaAngleRad = currentAngle - startPointerAngle
    const deltaAngleDeg = (deltaAngleRad * 180) / Math.PI

    let nextRotation = (startAngle + deltaAngleDeg) % 360
    if (nextRotation < 0) nextRotation += 360

    onUpdateLayer(layer.id, { rotation: Math.round(nextRotation) })
  }

  const handleRotateUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rotateDragRef.current) return
    e.stopPropagation()
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {}
    rotateDragRef.current = null
  }

  // Render a decal preview on the large dielines
  const renderDecal2D = (layer: DecalLayer, boxWidth: number) => {
    const isSel = layer.id === state.selectedLayerId

    const aspect = layer.aspect || 1.0

    const heightPx = layer.scale * 0.81 * boxWidth
    const widthPx = heightPx * aspect

    return (
      <div
        key={layer.id}
        className="dieline-decal-preview"
        style={{
          position: 'absolute',
          left: `${(layer.offsetX + 0.5) * 100}%`,
          top: `${(0.5 - layer.offsetY) * 100}%`,
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
          borderColor: isSel ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
          background: isSel ? 'rgba(204, 255, 0, 0.15)' : 'rgba(255,255,255,0.05)',
          cursor: 'move',
          zIndex: isSel ? 10 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPointerDown={(e) => handlePointerDown(e, layer)}
        onPointerMove={(e) => handlePointerMove(e, layer)}
        onPointerUp={handlePointerUp}
      >
        {layer.type === 'image' && layer.url ? (
          <img
            className="dieline-decal-img"
            src={layer.url}
            alt="decal"
            style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
          />
        ) : (
          <span
            className="dieline-decal-txt"
            style={{
              color: layer.color || '#ffffff',
              fontFamily: layer.fontFamily || 'Plus Jakarta Sans',
              fontSize: `${Math.max(10, heightPx * 0.35)}px`,
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {layer.text || 'TEXT'}
          </span>
        )}

        {isSel && (
          <>
            <div
              className="dieline-handle top-left"
              onPointerDown={(e) => handleScaleStart(e, layer)}
              onPointerMove={(e) => handleScaleMove(e, layer)}
              onPointerUp={handleScaleUp}
            />
            <div
              className="dieline-handle top-right"
              onPointerDown={(e) => handleScaleStart(e, layer)}
              onPointerMove={(e) => handleScaleMove(e, layer)}
              onPointerUp={handleScaleUp}
            />
            <div
              className="dieline-handle bottom-left"
              onPointerDown={(e) => handleScaleStart(e, layer)}
              onPointerMove={(e) => handleScaleMove(e, layer)}
              onPointerUp={handleScaleUp}
            />
            <div
              className="dieline-handle bottom-right"
              onPointerDown={(e) => handleScaleStart(e, layer)}
              onPointerMove={(e) => handleScaleMove(e, layer)}
              onPointerUp={handleScaleUp}
            />
            <div
              className="dieline-handle rotate-handle"
              onPointerDown={(e) => handleRotateStart(e, layer)}
              onPointerMove={(e) => handleRotateMove(e, layer)}
              onPointerUp={handleRotateUp}
            />
          </>
        )}
      </div>
    )
  }
  return (
    <div className="dieline-workspace-main" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      background: '#09090B'
    }}>
      {/* Title Header */}
      <div className="dieline-header">
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>Editor de Patrones 2D</h2>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          Arrastra, escala y rota los diseños directamente en las piezas. Haz clic en una pieza para seleccionarla.
        </span>
      </div>

      {/* Grid of Large Dielines */}
      <div className="dieline-pieces-container" style={{
        maxWidth: '1200px'
      }}>
        {/* LEFT SLEEVE (width: 180, height: 126) */}
        <div
          onClick={() => {
            onUpdate({ activeRegion: 'left-sleeve' })
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { region: 'left-sleeve' })
            }
          }}
          style={{
            position: 'relative',
            width: '180px',
            height: '126px',
            transition: 'transform 0.2s',
            transform: state.activeRegion === 'left-sleeve' ? 'scale(1.03)' : 'none',
            cursor: 'pointer'
          }}
        >
          <svg viewBox="0 0 100 70" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path
              d="M 12 65 L 88 65 L 95 45 C 82 42, 72 10, 50 10 C 28 10, 18 42, 5 45 L 12 65 Z"
              fill={state.shirtColor}
              stroke={state.activeRegion === 'left-sleeve' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)'}
              strokeWidth={state.activeRegion === 'left-sleeve' ? '2' : '1.2'}
              style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4))', transition: 'fill 0.4s, stroke 0.2s' }}
            />
          </svg>

          {/* Safety area dashed rectangle */}
          <div style={{
            position: 'absolute',
            left: '30%',
            top: '38%',
            width: '40%',
            height: '45%',
            border: '1.2px dashed #CCFF00',
            pointerEvents: 'none',
            borderRadius: '2px',
            opacity: 0.85
          }} />

          <span style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '600',
            color: state.activeRegion === 'left-sleeve' ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Manga Izq</span>

          {state.layers.map(layer => {
            if (layer.region === 'left-sleeve' && layer.visible) {
              return renderDecal2D(layer, 180)
            }
            return null
          })}
        </div>

        {/* FRONT (width: 250, height: 325) */}
        <div
          onClick={() => {
            onUpdate({ activeRegion: 'front' })
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { region: 'front' })
            }
          }}
          style={{
            position: 'relative',
            width: '250px',
            height: '325px',
            transition: 'transform 0.2s',
            transform: state.activeRegion === 'front' ? 'scale(1.03)' : 'none',
            cursor: 'pointer'
          }}
        >
          <svg viewBox="0 0 100 130" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path
              d="M 34 15 L 14 22 C 22 30, 24 42, 18 52 L 18 125 L 82 125 L 82 52 C 76 42, 78 30, 86 22 L 66 15 C 66 28, 58 35, 50 35 C 42 35, 34 28, 34 15 Z"
              fill={state.shirtColor}
              stroke={state.activeRegion === 'front' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)'}
              strokeWidth={state.activeRegion === 'front' ? '2' : '1.2'}
              style={{ filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.5))', transition: 'fill 0.4s, stroke 0.2s' }}
            />
          </svg>

          {/* Safety area dashed rectangle */}
          <div style={{
            position: 'absolute',
            left: '38%',
            top: '35%',
            width: '24%',
            height: '40%',
            border: '1.2px dashed #CCFF00',
            pointerEvents: 'none',
            borderRadius: '2px',
            opacity: 0.85
          }} />

          <span style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '600',
            color: state.activeRegion === 'front' ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Frente</span>

          {state.layers.map(layer => {
            if (layer.region === 'front' && layer.visible) {
              return renderDecal2D(layer, 250)
            }
            return null
          })}
        </div>

        {/* BACK (width: 250, height: 325) */}
        <div
          onClick={() => {
            onUpdate({ activeRegion: 'back' })
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { region: 'back' })
            }
          }}
          style={{
            position: 'relative',
            width: '250px',
            height: '325px',
            transition: 'transform 0.2s',
            transform: state.activeRegion === 'back' ? 'scale(1.03)' : 'none',
            cursor: 'pointer'
          }}
        >
          <svg viewBox="0 0 100 130" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path
              d="M 34 15 L 14 22 C 22 30, 24 42, 18 52 L 18 125 L 82 125 L 82 52 C 76 42, 78 30, 86 22 L 66 15 C 66 18, 58 20, 50 20 C 42 20, 34 18, 34 15 Z"
              fill={state.shirtColor}
              stroke={state.activeRegion === 'back' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)'}
              strokeWidth={state.activeRegion === 'back' ? '2' : '1.2'}
              style={{ filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.5))', transition: 'fill 0.4s, stroke 0.2s' }}
            />
          </svg>

          {/* Safety area dashed rectangle */}
          <div style={{
            position: 'absolute',
            left: '38%',
            top: '35%',
            width: '24%',
            height: '40%',
            border: '1.2px dashed #CCFF00',
            pointerEvents: 'none',
            borderRadius: '2px',
            opacity: 0.85
          }} />

          <span style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '600',
            color: state.activeRegion === 'back' ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Espalda</span>

          {state.layers.map(layer => {
            if (layer.region === 'back' && layer.visible) {
              return renderDecal2D(layer, 250)
            }
            return null
          })}
        </div>

        {/* RIGHT SLEEVE (width: 180, height: 126) */}
        <div
          onClick={() => {
            onUpdate({ activeRegion: 'right-sleeve' })
            if (selectedLayer) {
              onUpdateLayer(selectedLayer.id, { region: 'right-sleeve' })
            }
          }}
          style={{
            position: 'relative',
            width: '180px',
            height: '126px',
            transition: 'transform 0.2s',
            transform: state.activeRegion === 'right-sleeve' ? 'scale(1.03)' : 'none',
            cursor: 'pointer'
          }}
        >
          <svg viewBox="0 0 100 70" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path
              d="M 12 65 L 88 65 L 95 45 C 82 42, 72 10, 50 10 C 28 10, 18 42, 5 45 L 12 65 Z"
              fill={state.shirtColor}
              stroke={state.activeRegion === 'right-sleeve' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)'}
              strokeWidth={state.activeRegion === 'right-sleeve' ? '2' : '1.2'}
              style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4))', transition: 'fill 0.4s, stroke 0.2s' }}
            />
          </svg>

          {/* Safety area dashed rectangle */}
          <div style={{
            position: 'absolute',
            left: '30%',
            top: '38%',
            width: '40%',
            height: '45%',
            border: '1.2px dashed #CCFF00',
            pointerEvents: 'none',
            borderRadius: '2px',
            opacity: 0.85
          }} />

          <span style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            fontWeight: '600',
            color: state.activeRegion === 'right-sleeve' ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Manga Der</span>

          {state.layers.map(layer => {
            if (layer.region === 'right-sleeve' && layer.visible) {
              return renderDecal2D(layer, 180)
            }
            return null
          })}
        </div>
      </div>

      {/* Floating 3D Picture-in-Picture Preview Window */}
      <div className="pip-3d-container" style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        width: '300px',
        height: '300px',
        background: 'rgba(20, 20, 25, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 100,
        transition: 'height 0.3s ease, width 0.3s ease',
        ...(isPipMinimized ? { width: '180px', height: '40px' } : {})
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: isPipMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsPipMinimized(!isPipMinimized)}
        >
          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Previsualización 3D</span>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            padding: 0,
            fontSize: '14px',
            fontWeight: 'bold',
            lineHeight: 1
          }}>
            {isPipMinimized ? '＋' : '－'}
          </button>
        </div>

        {/* 3D Canvas Body */}
        {!isPipMinimized && (
          <div style={{ flex: 1, position: 'relative' }}>
            <MockupViewer
              state={state}
              onUpdate={onUpdate}
              onUpdateLayer={onUpdateLayer}
              isMini={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
