import { useState, useCallback, useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { MockupViewer } from './components/MockupViewer'
import { DielineWorkspace } from './components/DielineWorkspace'
import { CarWrapWorkspace } from './components/CarWrapWorkspace'
import { QuoteModal } from './components/QuoteModal'

export interface DecalLayer {
  id: string
  type: 'image' | 'text'
  url: string | null         // Object URL for images or canvas data URL for texts
  text?: string              // For text layers
  fontFamily?: string        // For text layers
  color?: string             // For text layers
  region: 'front' | 'back' | 'left-sleeve' | 'right-sleeve'
  scale: number
  offsetX: number
  offsetY: number
  rotation: number           // in degrees (0 to 360)
  visible: boolean
  aspect?: number            // Aspect ratio of the layer (width / height)
}

export interface MockupState {
  shirtColor: string
  bgColor: string
  bgColor2: string
  isGradient: boolean
  layers: DecalLayer[]
  selectedLayerId: string | null
  activeRegion: 'front' | 'back' | 'left-sleeve' | 'right-sleeve'
  environment: 'studio' | 'city' | 'sunset'
  ambientIntensity: number
  directionalIntensity: number
  lightAngle: number
  autoRotate: boolean
  activeTab: '3d' | '2d'
  mockupType: 'tshirt' | 'car'
}

const DEFAULT_STATE: MockupState = {
  shirtColor: '#ffffff',
  bgColor: '#1F2026', // Studio Grey
  bgColor2: '#1F2026',
  isGradient: false,
  layers: [],
  selectedLayerId: null,
  activeRegion: 'front',
  environment: 'city',
  ambientIntensity: 0.15,
  directionalIntensity: 0.00,
  lightAngle: 0,
  autoRotate: false,
  activeTab: '3d',
  mockupType: 'tshirt',
}

export function clampDecalPosition(
  region: 'front' | 'back' | 'left-sleeve' | 'right-sleeve',
  offsetX: number,
  offsetY: number,
  scale: number = 0.3,
  aspectRatio: number = 1.0
): { offsetX: number; offsetY: number } {
  const halfSizeX = scale * 0.225 * aspectRatio
  const halfSizeY = scale * 0.225
  if (region === 'front' || region === 'back') {
    const limitX = 0.12 - halfSizeX
    const limitYMin = -0.25 + halfSizeY
    const limitYMax = 0.15 - halfSizeY

    const clampedX = limitX >= 0 ? Math.max(-limitX, Math.min(limitX, offsetX)) : 0
    const clampedY = limitYMin <= limitYMax ? Math.max(limitYMin, Math.min(limitYMax, offsetY)) : -0.05
    return { offsetX: clampedX, offsetY: clampedY }
  } else {
    // Sleeves: width safety is z = [-0.08, 0.08], height safety is y = [0.02, 0.18]
    // with offset +0.10, offsetY range is [-0.08, 0.08]
    const limitX = 0.08 - halfSizeX
    const clampedX = limitX >= 0 ? Math.max(-limitX, Math.min(limitX, offsetX)) : 0

    const minY = -0.08 + halfSizeY
    const maxY = 0.08 - halfSizeY
    const clampedY = minY <= maxY ? Math.max(minY, Math.min(maxY, offsetY)) : 0
    return { offsetX: clampedX, offsetY: clampedY }
  }
}

export default function App() {
  const [state, setState] = useState<MockupState>(DEFAULT_STATE)
  const [exportFn, setExportFn] = useState<((callback?: (dataUrl: string) => void) => void) | null>(null)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [quoteImage, setQuoteImage] = useState('')
  const [tourStep, setTourStep] = useState<number | null>(null)

  const handleQuoteClick = () => {
    if (exportFn) {
      exportFn((imgUrl) => {
        if (imgUrl) {
          setQuoteImage(imgUrl);
          setIsQuoteOpen(true);
        }
      });
    } else {
      alert("El visualizador 3D aún se está cargando. Inténtalo de nuevo en unos segundos.");
    }
  };

  // Sync with website customizer theme & accent choices from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const theme = localStorage.getItem('kaze-theme') || 'dark';
      const accent = localStorage.getItem('kaze-accent') || 'gold';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-accent', accent);
    };

    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kaze-theme-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kaze-theme-update', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const isCompleted = localStorage.getItem('mockup_tour_completed')
    if (!isCompleted) {
      setTourStep(1)
    }
  }, [])

  const nextTourStep = () => {
    setTourStep(prev => {
      if (prev === null) return null
      if (prev < 3) return prev + 1
      localStorage.setItem('mockup_tour_completed', 'true')
      return null
    })
  }

  const skipTour = () => {
    localStorage.setItem('mockup_tour_completed', 'true')
    setTourStep(null)
  }

  const update = useCallback((patch: Partial<MockupState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const updateLayer = useCallback((id: string, patch: Partial<DecalLayer>) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map(l => {
        if (l.id !== id) return l
        const merged = { ...l, ...patch }
        
        // Calculate aspect ratio dynamically only if text or font changed, or if aspect is not set
        let aspect = merged.aspect || 1.0
        if (merged.type === 'text' && merged.text && (patch.text !== undefined || patch.fontFamily !== undefined || !merged.aspect)) {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.font = `bold 64px "${merged.fontFamily || 'Plus Jakarta Sans'}", sans-serif`
            const metrics = ctx.measureText(merged.text)
            const textWidth = Math.max(10, Math.ceil(metrics.width))
            const textHeight = 80 // font height 64px + 16px padding
            aspect = textWidth / textHeight
          }
        }

        const isTorso = merged.region === 'front' || merged.region === 'back'
        const maxScaleX = isTorso ? (0.24 / (0.45 * aspect)) : (0.16 / (0.45 * aspect))
        const maxScaleY = isTorso ? (0.40 / 0.45) : (0.16 / 0.45)
        const maxScale = Math.min(maxScaleX, maxScaleY)

        merged.scale = Math.max(0.01, Math.min(maxScale, merged.scale))
        
        // Clamp coordinates based on print safety boundaries
        const clampedPos = clampDecalPosition(merged.region, merged.offsetX, merged.offsetY, merged.scale, aspect)
        merged.offsetX = clampedPos.offsetX
        merged.offsetY = clampedPos.offsetY
        
        return merged
      })
    }))
  }, [])

  const addLayer = useCallback((type: 'image' | 'text', urlOrText?: string) => {
    const newLayer: DecalLayer = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      url: type === 'image' ? (urlOrText || null) : null,
      text: type === 'text' ? (urlOrText || 'TEXTO') : undefined,
      fontFamily: type === 'text' ? 'Plus Jakarta Sans' : undefined,
      color: type === 'text' ? '#ffffff' : undefined,
      region: 'front',
      scale: 0.30,
      offsetX: 0,
      offsetY: -0.05,
      rotation: 0,
      visible: true,
      aspect: 1.0,
    }

    setState(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newLayer.id,
      activeRegion: 'front',
    }))

    // Load image aspect ratio asynchronously to prevent stretching/squishing
    if (type === 'image' && urlOrText) {
      const img = new Image()
      img.onload = () => {
        const aspect = img.width / img.height
        updateLayer(newLayer.id, { aspect })
      }
      img.src = urlOrText
    }
  }, [updateLayer])

  const removeLayer = useCallback((id: string) => {
    setState(prev => {
      const layerToRemove = prev.layers.find(l => l.id === id)
      if (layerToRemove && layerToRemove.type === 'image' && layerToRemove.url) {
        if (layerToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(layerToRemove.url)
        }
      }
      const nextLayers = prev.layers.filter(l => l.id !== id)
      return {
        ...prev,
        layers: nextLayers,
        selectedLayerId: prev.selectedLayerId === id
          ? (nextLayers[0]?.id || null)
          : prev.selectedLayerId
      }
    })
  }, [])
  return (
    <div className="app-layout-root">
      {state.mockupType === 'tshirt' ? (
        <>
          {/* Main Top Header */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-glass)',
            backgroundColor: 'var(--bg-obsidian)',
            padding: '12px 24px',
            height: '56px',
            zIndex: 20,
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="panel-logo" style={{ transform: 'none', margin: 0 }}>✦</div>
                <span className="panel-title" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-white)' }}>MockupMKR</span>
              </div>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-glass)' }}></div>
              <select
                value={state.mockupType || 'tshirt'}
                onChange={(e) => {
                  if (e.target.value === 'car') {
                    update({ mockupType: 'car' })
                  }
                }}
                style={{
                  background: 'var(--bg-darker)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-white)',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="tshirt">👕 Camiseta 3D (T-Shirt)</option>
                <option value="car">🚗 Rotulación de Auto 2D (WrapStudio)</option>
              </select>
            </div>
            
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Local Dev Mode (v1.2.0)</span>
            </div>
          </header>

          <div className="app-body">
            {/* Left panel */}
            <ControlPanel
              state={state}
              onUpdate={update}
              onAddLayer={addLayer}
              onRemoveLayer={removeLayer}
              onUpdateLayer={updateLayer}
              onExport={() => exportFn?.()}
              onQuote={handleQuoteClick}
            />

            {/* Main Viewport Workspace: 3D Studio or 2D Pattern Canvas */}
            <div className="viewer-container">
              {state.activeTab === '3d' ? (
                <>
                  <MockupViewer
                    state={state}
                    onUpdate={update}
                    onUpdateLayer={updateLayer}
                    onExportReady={setExportFn}
                  />
                  {/* Top-right badge */}
                  <div className="viewer-badge">
                    Drag to rotate · Scroll to zoom
                  </div>
                </>
              ) : (
                <DielineWorkspace
                  state={state}
                  onUpdate={update}
                  onUpdateLayer={updateLayer}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <CarWrapWorkspace
          onBackToTshirt={() => update({ mockupType: 'tshirt' })}
        />
      )}

      {/* Onboarding Tutorial Overlay */}
      {tourStep !== null && (
        <div className="onboarding-overlay">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <span className="onboarding-step-count">Paso {tourStep} de 3</span>
              <button className="onboarding-skip-btn" onClick={skipTour}>Saltar tutorial</button>
            </div>
            
            <div className="onboarding-body">
              {tourStep === 1 && (
                <>
                  <h3>🌍 Visor 3D Interactivo</h3>
                  <p>Cargamos la camiseta con zoom optimizado para ti. Arrastra la camiseta para rotarla en 3D. Pellizca con dos dedos (móvil) o usa la rueda del mouse para acercar/alejar detalles.</p>
                </>
              )}
              {tourStep === 2 && (
                <>
                  <h3>🎨 Agrega tus Diseños</h3>
                  <p>Haz clic en <strong>+ Add Image</strong> o <strong>+ Add Text</strong> en el panel para subir logotipos o frases y comenzar a personalizar la prenda.</p>
                </>
              )}
              {tourStep === 3 && (
                <>
                  <h3>📐 Tiradores "Estilo Photoshop"</h3>
                  <p>Arrastra tu diseño en 3D directamente sobre la camiseta. En la pestaña <strong>2D Pattern</strong> o sobre el 3D, usa los tiradores de las esquinas para cambiar el tamaño y la rotación del diseño libremente.</p>
                </>
              )}
            </div>

            <div className="onboarding-footer">
              <div className="onboarding-dots">
                <span className={`dot ${tourStep === 1 ? 'active' : ''}`} />
                <span className={`dot ${tourStep === 2 ? 'active' : ''}`} />
                <span className={`dot ${tourStep === 3 ? 'active' : ''}`} />
              </div>
              <button className="btn-base btn-tour-next" onClick={nextTourStep}>
                {tourStep === 3 ? '¡Comenzar a Diseñar!' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <QuoteModal 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
        mockupImage={quoteImage} 
        defaultService="apparel" 
      />
    </div>
  )
}
