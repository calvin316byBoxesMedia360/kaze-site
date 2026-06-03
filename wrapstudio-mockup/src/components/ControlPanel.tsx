import React, { useRef, useState } from 'react'
import type { MockupState, DecalLayer } from '../App'
import { Send, Download } from 'lucide-react'

function trimCanvas(canvas: HTMLCanvasElement): {
  trimmedCanvas: HTMLCanvasElement
  aspect: number
  trimRect?: {
    x: number
    y: number
    w: number
    h: number
    origW: number
    origH: number
  }
} {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { trimmedCanvas: canvas, aspect: canvas.width / canvas.height }
  
  const width = canvas.width
  const height = canvas.height
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const alpha = data[idx + 3]
      if (alpha > 5) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  
  if (maxX < minX || maxY < minY) {
    return {
      trimmedCanvas: canvas,
      aspect: width / height,
      trimRect: { x: 0, y: 0, w: width, h: height, origW: width, origH: height }
    }
  }
  
  const trimmedWidth = (maxX - minX) + 1
  const trimmedHeight = (maxY - minY) + 1
  
  const trimmedCanvas = document.createElement('canvas')
  trimmedCanvas.width = trimmedWidth
  trimmedCanvas.height = trimmedHeight
  const trimmedCtx = trimmedCanvas.getContext('2d')
  if (!trimmedCtx) return { trimmedCanvas: canvas, aspect: width / height }
  
  trimmedCtx.drawImage(
    canvas,
    minX, minY, trimmedWidth, trimmedHeight,
    0, 0, trimmedWidth, trimmedHeight
  )
  
  return {
    trimmedCanvas,
    aspect: trimmedWidth / trimmedHeight,
    trimRect: { x: minX, y: minY, w: trimmedWidth, h: trimmedHeight, origW: width, origH: height }
  }
}

function removeImageBackground(imageUrl: string, threshold = 40): Promise<{
  url: string
  aspect: number
  trimRect?: {
    x: number
    y: number
    w: number
    h: number
    origW: number
    origH: number
  }
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Cannot get 2D context'))
        return
      }
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      let bgR = data[0]
      let bgG = data[1]
      let bgB = data[2]
      let bgA = data[3]
      
      if (bgA < 50) {
        const corners = [
          { x: canvas.width - 1, y: 0 },
          { x: 0, y: canvas.height - 1 },
          { x: canvas.width - 1, y: canvas.height - 1 }
        ]
        for (const corner of corners) {
          const idx = (corner.y * canvas.width + corner.x) * 4
          if (data[idx + 3] >= 50) {
            bgR = data[idx]
            bgG = data[idx + 1]
            bgB = data[idx + 2]
            bgA = data[idx + 3]
            break
          }
        }
      }
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        const distance = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        )
        
        if (distance <= threshold) {
          data[i + 3] = 0
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
      const { trimmedCanvas, aspect, trimRect } = trimCanvas(canvas)
      resolve({
        url: trimmedCanvas.toDataURL('image/png'),
        aspect,
        trimRect
      })
    }
    img.onerror = (err) => {
      reject(err)
    }
    img.src = imageUrl
  })
}

interface Props {
  state: MockupState
  onUpdate: (patch: Partial<MockupState>) => void
  onAddLayer: (type: 'image' | 'text', urlOrText?: string) => void
  onRemoveLayer: (id: string) => void
  onUpdateLayer: (id: string, patch: Partial<DecalLayer>) => void
  onExport: () => void
  onQuote: () => void
}



const GOOGLE_FONTS = [
  'Plus Jakarta Sans',
  'Space Mono',
  'Montserrat',
  'Playfair Display',
  'Cinzel',
  'Caveat',
]

export const SHIRT_COLORS = [
  { value: '#FFFFFF', label: 'Blanco' },
  { value: '#121212', label: 'Negro' },
  { value: '#0F2C59', label: 'Azul' },
  { value: '#1C6758', label: 'Verde' },
  { value: '#FFC26F', label: 'Amarillo' },
  { value: '#C82A2A', label: 'Rojo' },
  { value: '#FF87B2', label: 'Rosado' },
  { value: '#78C1F3', label: 'Celeste' },
] as const

export function ControlPanel({
  state,
  onUpdate,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onExport,
  onQuote
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isProcessingBg, setIsProcessingBg] = useState(false)
  
  const selectedLayer = state.layers.find(l => l.id === state.selectedLayerId) || null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onAddLayer('image', url)
    e.target.value = ''
  }

  return (
    <aside className="control-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-logo">✦</div>
        <span className="panel-title">MockupMKR</span>
      </div>

      {/* Tab Buttons */}
      <div style={{ padding: '0 24px', marginTop: '12px' }}>
        <div className="dieline-tab-buttons">
          <button
            onClick={() => onUpdate({ activeTab: '3d' })}
            className={`dieline-tab-btn ${state.activeTab === '3d' ? 'dieline-tab-btn--active' : ''}`}
          >
            3D Studio
          </button>
          <button
            onClick={() => onUpdate({ activeTab: '2d' })}
            className={`dieline-tab-btn ${state.activeTab === '2d' ? 'dieline-tab-btn--active' : ''}`}
          >
            2D Pattern
          </button>
        </div>
      </div>

      {/* Scrollable controls */}
      <div className="panel-content">
        {state.activeTab === '2d' ? (
          <>
            {/* Shirt Color Palette in 2D */}
            <Section label="Color de Camiseta">
              <div className="shirt-color-palette" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 8px 0' }}>
                {SHIRT_COLORS.map(c => {
                  const isActive = state.shirtColor.toLowerCase() === c.value.toLowerCase()
                  return (
                    <button
                      key={c.value}
                      onClick={() => onUpdate({ shirtColor: c.value })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.value,
                        border: isActive ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.2s, border-color 0.2s',
                        transform: isActive ? 'scale(1.15)' : 'none',
                      }}
                      title={c.label}
                    />
                  )
                })}
              </div>
            </Section>

            {/* Decal Layers Manager */}
            <Section label="Diseños y Textos (2D)">
              <div className="chip-group" style={{ marginBottom: '8px' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-base btn-upload"
                  style={{ flex: 1, padding: '8px 12px' }}
                >
                  + Add Image
                </button>
                <button
                  onClick={() => onAddLayer('text')}
                  className="btn-base btn-filled"
                  style={{ flex: 1, padding: '8px 12px' }}
                >
                  + Add Text
                </button>
              </div>

              {state.layers.length > 0 ? (
                <div className="layers-manager-list">
                  {state.layers.map(layer => {
                    const isSel = layer.id === state.selectedLayerId
                    return (
                      <div
                        key={layer.id}
                        onClick={() => onUpdate({ selectedLayerId: layer.id, activeRegion: layer.region })}
                        className={`layer-item-row ${isSel ? 'layer-item-row--selected' : ''}`}
                      >
                        <div className="layer-item-left">
                          <span className="layer-item-type-badge">{layer.type}</span>
                          <span className="layer-item-name">
                            {layer.type === 'text' ? (layer.text || 'Text') : `Image Layer`}
                          </span>
                        </div>
                        <div className="layer-item-actions">
                          <button
                            title="Toggle Visibility"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateLayer(layer.id, { visible: !layer.visible })
                            }}
                            className="layer-action-btn"
                          >
                            {layer.visible ? '👁' : '✖'}
                          </button>
                          <button
                            title="Delete Layer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveLayer(layer.id)
                            }}
                            className="layer-action-btn layer-action-btn--danger"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px 0', fontSize: '12px' }}>
                  No active decals.
                </div>
              )}
            </Section>
          </>
        ) : (
          <>
            {/* Shirt Color Palette in 3D */}
            <Section label="Color de Camiseta">
              <div className="shirt-color-palette" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 8px 0' }}>
                {SHIRT_COLORS.map(c => {
                  const isActive = state.shirtColor.toLowerCase() === c.value.toLowerCase()
                  return (
                    <button
                      key={c.value}
                      onClick={() => onUpdate({ shirtColor: c.value })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c.value,
                        border: isActive ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.2s, border-color 0.2s',
                        transform: isActive ? 'scale(1.15)' : 'none',
                      }}
                      title={c.label}
                    />
                  )
                })}
              </div>
            </Section>

            {/* Background Presets */}
            <Section label="Backdrops">
              <div className="preset-grid">
                <div
                  className="preset-card preset-card--active"
                  style={{ background: '#1F2026' }}
                  onClick={() => onUpdate({
                    bgColor: '#1F2026',
                    bgColor2: '#1F2026',
                    isGradient: false
                  })}
                >
                  <span className="tooltip">Studio Grey</span>
                </div>
              </div>
            </Section>

            {/* Decal Layers Manager */}
            <Section label="Graphic Decals (3D)">
              <div className="chip-group" style={{ marginBottom: '8px' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-base btn-upload"
                  style={{ flex: 1, padding: '8px 12px' }}
                >
                  + Add Image
                </button>
                <button
                  onClick={() => onAddLayer('text')}
                  className="btn-base btn-filled"
                  style={{ flex: 1, padding: '8px 12px' }}
                >
                  + Add Text
                </button>
              </div>

              {state.layers.length > 0 ? (
                <div className="layers-manager-list">
                  {state.layers.map(layer => {
                    const isSel = layer.id === state.selectedLayerId
                    return (
                      <div
                        key={layer.id}
                        onClick={() => onUpdate({ selectedLayerId: layer.id, activeRegion: layer.region })}
                        className={`layer-item-row ${isSel ? 'layer-item-row--selected' : ''}`}
                      >
                        <div className="layer-item-left">
                          <span className="layer-item-type-badge">{layer.type}</span>
                          <span className="layer-item-name">
                            {layer.type === 'text' ? (layer.text || 'Text') : `Image Layer`}
                          </span>
                        </div>
                        <div className="layer-item-actions">
                          <button
                            title="Toggle Visibility"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateLayer(layer.id, { visible: !layer.visible })
                            }}
                            className="layer-action-btn"
                          >
                            {layer.visible ? '👁' : '✖'}
                          </button>
                          <button
                            title="Delete Layer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveLayer(layer.id)
                            }}
                            className="layer-action-btn layer-action-btn--danger"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px 0', fontSize: '12px' }}>
                  No active decals.
                </div>
              )}
            </Section>
          </>
        )}

        {/* Selected Layer Customizer (Rendered below in either tab if a layer is selected) */}
        {selectedLayer && (
          <Section label={`Edit Decal: ${selectedLayer.type.toUpperCase()}`}>
            {/* Text options rendered at the top if selected layer is text */}
            {selectedLayer.type === 'text' && (
              <>
                <div className="slider-container" style={{ gap: '4px' }}>
                  <span className="slider-label" style={{ fontSize: '12px', fontWeight: '600' }}>Text Content</span>
                  <input
                    type="text"
                    value={selectedLayer.text || ''}
                    onChange={e => onUpdateLayer(selectedLayer.id, { text: e.target.value })}
                    className="slider-value"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      padding: '8px',
                      color: 'var(--text-white)',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                </div>

                <div className="slider-container" style={{ gap: '4px' }}>
                  <span className="slider-label" style={{ fontSize: '12px', fontWeight: '600' }}>Font Family</span>
                  <select
                    value={selectedLayer.fontFamily || 'Plus Jakarta Sans'}
                    onChange={e => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                    className="slider-value"
                    style={{
                      width: '100%',
                      background: 'var(--bg-obsidian)',
                      border: '1px solid var(--border-glass)',
                      padding: '8px',
                      color: 'var(--text-white)',
                      fontFamily: 'inherit',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {GOOGLE_FONTS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <ColorRow
                  label="Text Color"
                  value={selectedLayer.color || '#ffffff'}
                  onChange={col => onUpdateLayer(selectedLayer.id, { color: col })}
                />
              </>
            )}

            {/* Scale slider labeled dynamically and clamped according to current region limits */}
            {(() => {
              let aspect = 1.0
              if (selectedLayer.type === 'text' && selectedLayer.text) {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  ctx.font = `bold 64px "${selectedLayer.fontFamily || 'Plus Jakarta Sans'}", sans-serif`
                  const metrics = ctx.measureText(selectedLayer.text)
                  const textWidth = Math.max(10, Math.ceil(metrics.width))
                  const textHeight = 80
                  aspect = textWidth / textHeight
                }
              }

              const isTorso = selectedLayer.region === 'front' || selectedLayer.region === 'back'
              const maxScaleX = isTorso ? (0.24 / (0.45 * aspect)) : (0.40 / (0.45 * aspect))
              const maxScaleY = isTorso ? (0.40 / 0.45) : (0.45 / 0.45)
              const maxScale = Math.min(maxScaleX, maxScaleY)

              return (
                <Slider
                  label={selectedLayer.type === 'text' ? "Tamaño del Texto" : "Escala de Imagen"}
                  min={0.01}
                  max={maxScale}
                  step={0.01}
                  value={selectedLayer.scale}
                  onChange={v => onUpdateLayer(selectedLayer.id, { scale: v })}
                />
              )
            })()}

            <Slider
              label="Rotation (Deg)"
              min={0} max={360} step={5}
              value={selectedLayer.rotation}
              onChange={v => onUpdateLayer(selectedLayer.id, { rotation: v })}
            />

            {/* Region dropdown selector */}
            <div className="slider-container" style={{ gap: '4px', margin: '8px 0' }}>
              <span className="slider-label" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Región de la Prenda (Área)</span>
              <select
                value={selectedLayer.region}
                onChange={e => {
                  const newRegion = e.target.value as DecalLayer['region']
                  onUpdateLayer(selectedLayer.id, { region: newRegion })
                  onUpdate({ activeRegion: newRegion })
                }}
                className="slider-value"
                style={{
                  width: '100%',
                  background: 'var(--bg-obsidian)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px',
                  color: 'var(--text-white)',
                  fontFamily: 'inherit',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="front">Frente (Front)</option>
                <option value="back">Espalda (Back)</option>
                <option value="left-sleeve">Manga Izquierda (L Sleeve)</option>
                <option value="right-sleeve">Manga Derecha (R Sleeve)</option>
              </select>
            </div>

            {/* Quick alignment and rotation buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0 6px 0' }}>
              <span className="slider-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Alineación y Giro
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                <button
                  onClick={() => {
                    const isTorso = selectedLayer.region === 'front' || selectedLayer.region === 'back'
                    onUpdateLayer(selectedLayer.id, { offsetX: 0, offsetY: isTorso ? -0.05 : 0 })
                  }}
                  className="btn-base btn-upload"
                  style={{ padding: '8px 12px', fontSize: '12px', width: '100%' }}
                >
                  🎯 Centrar Todo
                </button>
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { offsetX: 0 })}
                  className="btn-base btn-upload"
                  style={{ padding: '8px 12px', fontSize: '12px', width: '100%' }}
                >
                  ↔ Centrar X
                </button>
                <button
                  onClick={() => {
                    const isTorso = selectedLayer.region === 'front' || selectedLayer.region === 'back'
                    onUpdateLayer(selectedLayer.id, { offsetY: isTorso ? -0.05 : 0 })
                  }}
                  className="btn-base btn-upload"
                  style={{ padding: '8px 12px', fontSize: '12px', width: '100%' }}
                >
                  ↕ Centrar Y
                </button>
                <button
                  onClick={() => {
                    const nextRot = (selectedLayer.rotation + 90) % 360
                    onUpdateLayer(selectedLayer.id, { rotation: nextRot })
                  }}
                  className="btn-base btn-upload"
                  style={{ padding: '8px 12px', fontSize: '12px', width: '100%' }}
                >
                  🔄 Girar 90°
                </button>
              </div>
            </div>

            {/* Client-side background removal helper - only for image layers */}
            {selectedLayer.type === 'image' && selectedLayer.url && (
              <div style={{ margin: '14px 0 8px 0' }}>
                <button
                  disabled={isProcessingBg}
                  onClick={async () => {
                    if (!selectedLayer.url) return
                    setIsProcessingBg(true)
                    try {
                      const result = await removeImageBackground(selectedLayer.url)
                      
                      if (result.trimRect) {
                        const { x, y, w, h, origW, origH } = result.trimRect
                        const region = selectedLayer.region || 'front'
                        const boxWidth = (region === 'left-sleeve' || region === 'right-sleeve') ? 180 : 250
                        const boxHeight = (region === 'left-sleeve' || region === 'right-sleeve') ? 126 : 325
                        
                        // Center displacement of trimmed area from original center
                        const xcOrig = origW / 2
                        const ycOrig = origH / 2
                        const xcTrim = x + w / 2
                        const ycTrim = y + h / 2
                        
                        const dxRel = (xcTrim - xcOrig) / origW
                        const dyRel = (ycTrim - ycOrig) / origH
                        
                        // Bounding box dimensions on screen before trim
                        const scaleOrig = selectedLayer.scale
                        const aspectOrig = selectedLayer.aspect || (origW / origH)
                        const heightPxOrig = scaleOrig * 0.45 * boxWidth
                        const widthPxOrig = heightPxOrig * aspectOrig
                        
                        // Screen pixel displacement
                        const dxPx = dxRel * widthPxOrig
                        const dyPx = dyRel * heightPxOrig
                        
                        // Dieline coordinates displacement
                        const dOffsetX = dxPx / boxWidth
                        const dOffsetY = -dyPx / boxHeight
                        
                        // New scale and offsets
                        const scaleNew = scaleOrig * (h / origH)
                        const offsetXNew = (selectedLayer.offsetX || 0) + dOffsetX
                        const offsetYNew = (selectedLayer.offsetY || 0) + dOffsetY
                        
                        onUpdateLayer(selectedLayer.id, {
                          url: result.url,
                          aspect: result.aspect,
                          scale: Number(scaleNew.toFixed(3)),
                          offsetX: Number(offsetXNew.toFixed(4)),
                          offsetY: Number(offsetYNew.toFixed(4))
                        })
                      } else {
                        onUpdateLayer(selectedLayer.id, { url: result.url, aspect: result.aspect })
                      }
                    } catch (err) {
                      console.error('Error removing background:', err)
                    } finally {
                      setIsProcessingBg(false)
                    }
                  }}
                  className="btn-base btn-filled"
                  style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isProcessingBg ? '⏳ Removiendo fondo...' : '🪄 Quitar Fondo'}
                </button>
              </div>
            )}

            <button
              onClick={() => onRemoveLayer(selectedLayer.id)}
              className="btn-base btn-danger"
              style={{ marginTop: '8px' }}
            >
              Remove Layer
            </button>
          </Section>
        )}
      </div>

      {/* Export Button */}
      <div className="panel-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          onClick={onQuote} 
          className="btn-base btn-export" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'var(--accent)',
            color: '#09090B',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '800',
            height: '38px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--accent-glow-strong)',
            transition: 'all 0.2s',
            fontSize: '12px',
            width: '100%'
          }}
        >
          <Send className="size-4" /> Cotizar con este Diseño (Adjuntar PNG)
        </button>
        <button 
          onClick={onExport} 
          className="btn-base"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-body)',
            borderRadius: '8px',
            fontWeight: '600',
            height: '38px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '12px',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = 'var(--text-body)';
          }}
        >
          <Download className="size-4" /> Descargar PNG
        </button>
      </div>
    </aside>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control-section">
      <p className="section-label">{label}</p>
      <div className="controls-grid">
        {children}
      </div>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div className="color-picker-row">
      <span className="label">{label}</span>
      <div className="color-info">
        <span className="color-picker-hex">{value}</span>
        <div className="color-preview-btn" style={{ backgroundColor: value }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function Slider({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="slider-container">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="slider-input"
      />
    </div>
  )
}
