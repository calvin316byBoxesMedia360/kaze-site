import { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Decal, useTexture, useGLTF, ContactShadows, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { MockupState, DecalLayer } from '../App'

// ─── Decal Transform Helper ──────────────────────────────────
export function getDecalTransform(layer: DecalLayer): { position: [number, number, number]; rotation: [number, number, number] } {
  let position: [number, number, number] = [0, 0, 0.15]
  let rotation: [number, number, number] = [0, 0, 0]
  const rotRad = (layer.rotation * Math.PI) / 180

  if (layer.region === 'front') {
    position = [layer.offsetX, layer.offsetY, 0.15]
    rotation = [0, 0, rotRad]
  } else if (layer.region === 'back') {
    position = [-layer.offsetX, layer.offsetY, -0.15]
    rotation = [0, Math.PI, -rotRad]
  } else if (layer.region === 'left-sleeve') {
    position = [0.24, layer.offsetY, layer.offsetX]
    rotation = [0, Math.PI / 2, rotRad]
  } else if (layer.region === 'right-sleeve') {
    position = [-0.24, layer.offsetY, -layer.offsetX]
    rotation = [0, -Math.PI / 2, rotRad]
  }
  return { position, rotation }
}

// ─── Image Decal Component ───────────────────────────────────
function ImageDecal({ layer }: { layer: DecalLayer }) {
  const url = layer.url
  if (!url) return null

  const tex = useTexture(url)
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
  }, [tex])

  const { position, rotation } = useMemo(() => getDecalTransform(layer), [layer])
  const scale = layer.scale

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scale * 0.45 * (layer.aspect || 1.0), scale * 0.45, 0.25]}
    >
      <meshStandardMaterial
        map={tex}
        transparent
        polygonOffset
        polygonOffsetFactor={-1}
        depthWrite={false}
        roughness={0.82}
      />
    </Decal>
  )
}

// ─── Text Decal Component ────────────────────────────────────
function TextDecal({ layer }: { layer: DecalLayer }) {
  const [fontLoaded, setFontLoaded] = useState(false)
  const text = layer.text || ''
  const color = layer.color || '#ffffff'
  const fontFamily = layer.fontFamily || 'Plus Jakarta Sans'

  useEffect(() => {
    const fontId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link')
      link.id = fontId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`
      document.head.appendChild(link)
    }

    let isMounted = true
    const fontStr = `bold 64px "${fontFamily}"`

    if (document.fonts) {
      document.fonts.load(fontStr)
        .then(() => {
          if (isMounted) setFontLoaded(true)
        })
        .catch(() => {
          if (isMounted) setFontLoaded(true)
        })
    } else {
      const timer = setTimeout(() => {
        if (isMounted) setFontLoaded(true)
      }, 500)
      return () => clearTimeout(timer)
    }

    return () => {
      isMounted = false
    }
  }, [fontFamily])

  const { tex, aspect } = useMemo(() => {
    const canvas = document.createElement('canvas')
    const tempCtx = canvas.getContext('2d')
    if (!tempCtx) return { tex: null, aspect: 1.0 }

    tempCtx.font = `bold 64px "${fontFamily}", sans-serif`
    const metrics = tempCtx.measureText(text)
    const textWidth = Math.max(10, Math.ceil(metrics.width))
    const textHeight = 80 // font height 64px + 16px padding

    canvas.width = textWidth
    canvas.height = textHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return { tex: null, aspect: 1.0 }

    ctx.clearRect(0, 0, textWidth, textHeight)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.font = `bold 64px "${fontFamily}", sans-serif`
    ctx.fillText(text, textWidth / 2, textHeight / 2)

    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return { tex: t, aspect: textWidth / textHeight }
  }, [text, color, fontFamily, fontLoaded])

  if (!tex) return null

  const { position, rotation } = useMemo(() => getDecalTransform(layer), [layer])
  const scale = layer.scale

  return (
    <Decal
      position={position}
      rotation={rotation}
      scale={[scale * 0.45 * aspect, scale * 0.45, 0.25]}
    >
      <meshStandardMaterial
        map={tex}
        transparent
        polygonOffset
        polygonOffsetFactor={-1}
        depthWrite={false}
        roughness={0.82}
      />
    </Decal>
  )
}

// ─── Decal 3D Handles Component ─────────────────────────────
interface Decal3DHandlesProps {
  layer: DecalLayer
  onUpdateLayer: (id: string, patch: Partial<DecalLayer>) => void
  setIsDragging: (v: boolean) => void
  shirtMesh: THREE.Mesh | null
}

function Decal3DHandles({ layer, onUpdateLayer, setIsDragging, shirtMesh }: Decal3DHandlesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const dragModeRef = useRef<{ type: 'scale' | 'rotate' | 'move' } | null>(null)
  const dragStartRef = useRef<{
    initialDist: number
    initialScale: number
    initialRotation: number
    initialPointerAngle: number
  } | null>(null)
  const positionDragStartRef = useRef<{
    startLocalPoint: THREE.Vector3
    startOffsetX: number
    startOffsetY: number
  } | null>(null)
  
  const { raycaster } = useThree()
  const [hovered, setHovered] = useState<string | null>(null)

  const { position, rotation } = useMemo(() => getDecalTransform(layer), [layer])

  const aspect = useMemo(() => {
    if (layer.type === 'text' && layer.text) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = `bold 64px "${layer.fontFamily || 'Plus Jakarta Sans'}", sans-serif`
        const metrics = ctx.measureText(layer.text)
        const textWidth = Math.max(10, Math.ceil(metrics.width))
        const textHeight = 80
        return textWidth / textHeight
      }
    }
    return layer.aspect || 1.0
  }, [layer.type, layer.text, layer.fontFamily, layer.aspect])

  const sizeY = layer.scale * 0.45
  const sizeX = sizeY * aspect
  const halfX = sizeX / 2
  const halfY = sizeY / 2

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 
        hovered === 'rotate' ? 'grab' : 
        hovered === 'move' ? 'move' : 
        'nwse-resize'
    } else {
      document.body.style.cursor = 'auto'
    }
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  const handlePointerDown = useCallback((e: any, type: 'scale' | 'rotate') => {
    e.stopPropagation()
    if (e.target && typeof e.target.setPointerCapture === 'function') {
      e.target.setPointerCapture(e.pointerId)
    }

    if (groupRef.current && e.point) {
      const localPoint = groupRef.current.worldToLocal(e.point.clone())
      const dist = Math.hypot(localPoint.x, localPoint.y)
      const angleRad = Math.atan2(localPoint.y, localPoint.x)

      dragStartRef.current = {
        initialDist: dist || 0.05,
        initialScale: layer.scale,
        initialRotation: layer.rotation,
        initialPointerAngle: angleRad
      }
    }

    setIsDragging(true)
    dragModeRef.current = { type }
  }, [setIsDragging, layer.scale, layer.rotation])

  const handlePositionDragStart = useCallback((e: any) => {
    e.stopPropagation()
    if (e.target && typeof e.target.setPointerCapture === 'function') {
      e.target.setPointerCapture(e.pointerId)
    }

    if (shirtMesh && e.point) {
      const localPoint = shirtMesh.worldToLocal(e.point.clone())
      positionDragStartRef.current = {
        startLocalPoint: localPoint,
        startOffsetX: layer.offsetX,
        startOffsetY: layer.offsetY
      }
      setIsDragging(true)
      dragModeRef.current = { type: 'move' }
    }
  }, [shirtMesh, layer.offsetX, layer.offsetY, setIsDragging])

  const handlePointerMove = useCallback((e: any) => {
    if (!dragModeRef.current || !groupRef.current) return
    e.stopPropagation()

    const ray = e.ray || raycaster.ray
    if (!ray) return

    if (dragModeRef.current.type === 'move') {
      if (!positionDragStartRef.current || !shirtMesh) return
      
      // Raycast against the shirt mesh to follow its contours
      const intersects = raycaster.intersectObject(shirtMesh)
      let localPoint: THREE.Vector3 | null = null

      if (intersects.length > 0) {
        localPoint = shirtMesh.worldToLocal(intersects[0].point.clone())
      } else {
        // Fallback: intersect with decal plane
        const plane = new THREE.Plane()
        const normal = new THREE.Vector3(0, 0, 1)
        normal.applyQuaternion(groupRef.current.quaternion)
        const center = new THREE.Vector3()
        groupRef.current.getWorldPosition(center)
        plane.setFromNormalAndCoplanarPoint(normal, center)

        const intersection = new THREE.Vector3()
        if (ray.intersectPlane(plane, intersection)) {
          localPoint = shirtMesh.worldToLocal(intersection.clone())
        }
      }

      if (localPoint) {
        const startLocal = positionDragStartRef.current.startLocalPoint
        let deltaX = 0
        let deltaY = localPoint.y - startLocal.y

        if (layer.region === 'front') {
          deltaX = localPoint.x - startLocal.x
        } else if (layer.region === 'back') {
          deltaX = -(localPoint.x - startLocal.x)
        } else if (layer.region === 'left-sleeve') {
          deltaX = localPoint.z - startLocal.z
        } else if (layer.region === 'right-sleeve') {
          deltaX = -(localPoint.z - startLocal.z)
        }

        const nextOffsetX = positionDragStartRef.current.startOffsetX + deltaX
        const nextOffsetY = positionDragStartRef.current.startOffsetY + deltaY

        onUpdateLayer(layer.id, {
          offsetX: nextOffsetX,
          offsetY: nextOffsetY
        })
      }
      return
    }

    // Handle scale and rotate
    if (!dragStartRef.current) return

    const plane = new THREE.Plane()
    const normal = new THREE.Vector3(0, 0, 1)
    normal.applyQuaternion(groupRef.current.quaternion)

    const center = new THREE.Vector3()
    groupRef.current.getWorldPosition(center)
    plane.setFromNormalAndCoplanarPoint(normal, center)

    const intersection = new THREE.Vector3()
    if (ray.intersectPlane(plane, intersection)) {
      const localPoint = groupRef.current.worldToLocal(intersection.clone())

      if (dragModeRef.current.type === 'scale') {
        const dist = Math.hypot(localPoint.x, localPoint.y)
        const ratio = dist / dragStartRef.current.initialDist
        const nextScale = dragStartRef.current.initialScale * ratio
        onUpdateLayer(layer.id, { scale: nextScale })
      } else if (dragModeRef.current.type === 'rotate') {
        const angleRad = Math.atan2(localPoint.y, localPoint.x)
        const angleDeg = (angleRad * 180) / Math.PI
        const startAngleDeg = (dragStartRef.current.initialPointerAngle * 180) / Math.PI
        const deltaAngle = angleDeg - startAngleDeg

        let nextRotation = (dragStartRef.current.initialRotation + deltaAngle) % 360
        if (nextRotation < 0) nextRotation += 360
        onUpdateLayer(layer.id, { rotation: Math.round(nextRotation) })
      }
    }
  }, [raycaster, layer.id, onUpdateLayer, shirtMesh, layer.region])

  const handlePointerUp = useCallback((e: any) => {
    if (dragModeRef.current) {
      e.stopPropagation()
      if (e.target && typeof e.target.releasePointerCapture === 'function') {
        try {
          e.target.releasePointerCapture(e.pointerId)
        } catch (err) {}
      }
      dragModeRef.current = null
      dragStartRef.current = null
      positionDragStartRef.current = null
      setIsDragging(false)
      setHovered(null)
    }
  }, [setIsDragging])

  return (
    <group name="decal-3d-handles" ref={groupRef} position={position} rotation={rotation}>
      {/* Invisible Drag Area for relative move */}
      <mesh
        position={[0, 0, 0.001]}
        onPointerDown={handlePositionDragStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('move') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <planeGeometry args={[sizeX, sizeY]} />
        <meshBasicMaterial 
          color="#CCFF00" 
          transparent 
          opacity={hovered === 'move' ? 0.06 : 0} 
          depthWrite={false} 
        />
      </mesh>

      {/* Rectangular Outline */}
      <Line
        points={[
          [-halfX, halfY, 0.002],
          [halfX, halfY, 0.002],
          [halfX, -halfY, 0.002],
          [-halfX, -halfY, 0.002],
          [-halfX, halfY, 0.002],
        ]}
        color="#CCFF00"
        lineWidth={1.5}
      />

      {/* 4 Corner Scale Handles */}
      <mesh
        position={[-halfX, halfY, 0.003]}
        onPointerDown={(e) => handlePointerDown(e, 'scale')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('scale') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <boxGeometry args={[0.02, 0.02, 0.005]} />
        <meshBasicMaterial color="#CCFF00" />
      </mesh>
      <mesh
        position={[halfX, halfY, 0.003]}
        onPointerDown={(e) => handlePointerDown(e, 'scale')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('scale') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <boxGeometry args={[0.02, 0.02, 0.005]} />
        <meshBasicMaterial color="#CCFF00" />
      </mesh>
      <mesh
        position={[-halfX, -halfY, 0.003]}
        onPointerDown={(e) => handlePointerDown(e, 'scale')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('scale') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <boxGeometry args={[0.02, 0.02, 0.005]} />
        <meshBasicMaterial color="#CCFF00" />
      </mesh>
      <mesh
        position={[halfX, -halfY, 0.003]}
        onPointerDown={(e) => handlePointerDown(e, 'scale')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('scale') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <boxGeometry args={[0.02, 0.02, 0.005]} />
        <meshBasicMaterial color="#CCFF00" />
      </mesh>

      {/* Rotation Handle */}
      <Line
        points={[
          [0, halfY, 0.002],
          [0, halfY + 0.04, 0.002],
        ]}
        color="#CCFF00"
        lineWidth={1.5}
      />
      <mesh
        position={[0, halfY + 0.04, 0.003]}
        onPointerDown={(e) => handlePointerDown(e, 'rotate')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('rotate') }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

// ─── Decal Offset Calculator ─────────────────────────────────
/**
 * Translates UV coordinates or local coordinates to Decal offset values.
 * In Phase 2, we use a normalized range of [-0.5, 0.5] for both X and Y.
 * If mapping from UV coordinates directly, (u - 0.5) ranges from -0.5 to 0.5.
 */
export function calculateDecalOffset(
  u: number,
  v: number,
  width: number,
  height: number,
  calibrationX = 1.0,
  calibrationY = 1.0
) {
  const offsetX = (u - 0.5) * width * calibrationX
  const offsetY = (v - 0.5) * height * calibrationY
  return { offsetX, offsetY }
}

/**
 * Classifies a local 3D point into one of the four interactive regions of the T-shirt.
 */
export function classifyRegion(x: number, z: number): 'front' | 'back' | 'left-sleeve' | 'right-sleeve' {
  if (x > 0.17) {
    return 'left-sleeve'
  } else if (x < -0.17) {
    return 'right-sleeve'
  } else {
    if (z >= 0) {
      return 'front'
    } else {
      return 'back'
    }
  }
}

// ─── Safety Area Visualizer Component ────────────────────────
interface SafetyAreaVisualizerProps {
  region: 'front' | 'back' | 'left-sleeve' | 'right-sleeve'
}

function SafetyAreaVisualizer({ region }: SafetyAreaVisualizerProps) {
  const points = useMemo(() => {
    if (region === 'front') {
      const x = 0.12
      const yMin = -0.25
      const yMax = 0.15
      const z = 0.152
      return [
        [-x, yMax, z],
        [x, yMax, z],
        [x, yMin, z],
        [-x, yMin, z],
        [-x, yMax, z],
      ] as [number, number, number][]
    } else if (region === 'back') {
      const x = 0.12
      const yMin = -0.25
      const yMax = 0.15
      const z = -0.152
      return [
        [-x, yMax, z],
        [x, yMax, z],
        [x, yMin, z],
        [-x, yMin, z],
        [-x, yMax, z],
      ] as [number, number, number][]
    } else if (region === 'left-sleeve') {
      const x = 0.242
      const yMin = 0.02
      const yMax = 0.18
      const z = 0.08
      return [
        [x, yMax, -z],
        [x, yMax, z],
        [x, yMin, z],
        [x, yMin, -z],
        [x, yMax, -z],
      ] as [number, number, number][]
    } else { // right-sleeve
      const x = -0.242
      const yMin = 0.02
      const yMax = 0.18
      const z = 0.08
      return [
        [x, yMax, -z],
        [x, yMax, z],
        [x, yMin, z],
        [x, yMin, -z],
        [x, yMax, -z],
      ] as [number, number, number][]
    }
  }, [region])

  return (
    <Line
      name="safety-area-line"
      points={points}
      color="#CCFF00"
      lineWidth={1.2}
      dashed
      dashSize={0.015}
      gapSize={0.01}
    />
  )
}

// ─── Shirt Mesh Component (GLB) ──────────────────────────────
interface ShirtMeshProps {
  state: MockupState
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  isCameraMoving: boolean
  onUpdateLayer: (id: string, patch: Partial<DecalLayer>) => void
  onUpdate: (patch: Partial<MockupState>) => void
}

function ShirtMesh({
  state,
  isDragging,
  setIsDragging,
  isCameraMoving,
  onUpdateLayer,
  onUpdate,
}: ShirtMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { nodes } = useGLTF('shirt_baked.glb')

  const shirtMesh = useMemo(() => {
    const mesh = Object.values(nodes).find((node) => (node as any).isMesh) as THREE.Mesh
    if (mesh) {
      mesh.geometry.computeBoundingBox()
    }
    return mesh
  }, [nodes])

  const material = useMemo(() => {
    if (!shirtMesh || !shirtMesh.material) return null
    const originalMat = shirtMesh.material as THREE.Material
    const mat = originalMat.clone() as THREE.MeshStandardMaterial

    if ('color' in mat && mat.color) {
      mat.color.set(state.shirtColor)
    }

    mat.roughness = 0.82
    mat.metalness = 0.02
    return mat
  }, [shirtMesh, state.shirtColor])

  const handlePointerDown = useCallback((e: any) => {
    if (!shirtMesh) return

    // Transform intersection point to local coordinates of the mesh
    const localPoint = shirtMesh.worldToLocal(e.point.clone())
    const region = classifyRegion(localPoint.x, localPoint.z)

    // Map local coordinates to regional offsets
    let clickOffsetX = 0
    let clickOffsetY = localPoint.y
    if (region === 'front') {
      clickOffsetX = localPoint.x
    } else if (region === 'back') {
      clickOffsetX = -localPoint.x
    } else if (region === 'left-sleeve') {
      clickOffsetX = localPoint.z
    } else if (region === 'right-sleeve') {
      clickOffsetX = -localPoint.z
    }

    // Find if the click hit any of the decals (topmost first)
    let hitLayerId: string | null = null
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const layer = state.layers[i]
      if (layer.visible && layer.region === region) {
        const dx = clickOffsetX - layer.offsetX
        const dy = clickOffsetY - layer.offsetY
        const halfSize = (layer.scale * 0.45) / 2
        // Simple bounding box check
        if (Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize) {
          hitLayerId = layer.id
          break
        }
      }
    }

    if (hitLayerId) {
      e.stopPropagation()
      onUpdate({ selectedLayerId: hitLayerId, activeRegion: region })
    }
  }, [shirtMesh, state.layers, onUpdate])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (state.autoRotate && !isDragging) {
      meshRef.current.rotation.y += delta * 0.6
    }
  })

  if (!shirtMesh || !material) return null

  return (
    <mesh
      ref={meshRef}
      geometry={shirtMesh.geometry}
      material={material}
      scale={1.0}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
    >
      {state.layers.map((layer) => {
        if (!layer.visible) return null
        if (layer.type === 'image' && layer.url) {
          return (
            <Suspense key={layer.id} fallback={null}>
              <ImageDecal layer={layer} />
            </Suspense>
          )
        }
        if (layer.type === 'text') {
          return (
            <Suspense key={layer.id} fallback={null}>
              <TextDecal layer={layer} />
            </Suspense>
          )
        }
        return null
      })}

      {/* 3D handles and safety area visualizer for the selected layer */}
      {(() => {
        const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId)
        if (selectedLayer && selectedLayer.visible && !state.autoRotate && !isCameraMoving) {
          return (
            <>
              <SafetyAreaVisualizer region={selectedLayer.region} />
              <Decal3DHandles
                layer={selectedLayer}
                onUpdateLayer={onUpdateLayer}
                setIsDragging={setIsDragging}
                shirtMesh={shirtMesh}
              />
            </>
          )
        }
        return null
      })()}
    </mesh>
  )
}

// ─── Camera Handler for Outside Controls ────────────────────
function CameraHandler({
  helperRef,
  controlsRef
}: {
  helperRef: React.MutableRefObject<any>
  controlsRef: React.RefObject<any>
}) {
  const { camera } = useThree()

  useEffect(() => {
    helperRef.current = {
      zoomIn: () => {
        if (controlsRef.current) {
          const target = controlsRef.current.target
          const direction = new THREE.Vector3().subVectors(camera.position, target)
          const dist = direction.length()
          const nextDist = dist * 0.9
          if (nextDist >= 1.1) {
            camera.position.copy(target).addScaledVector(direction.normalize(), nextDist)
            controlsRef.current.update()
          }
        }
      },
      zoomOut: () => {
        if (controlsRef.current) {
          const target = controlsRef.current.target
          const direction = new THREE.Vector3().subVectors(camera.position, target)
          const dist = direction.length()
          const nextDist = dist * 1.1
          if (nextDist <= 3.5) {
            camera.position.copy(target).addScaledVector(direction.normalize(), nextDist)
            controlsRef.current.update()
          }
        }
      },
      reset: () => {
        camera.position.set(0, -0.05, 1.8)
        if (controlsRef.current) {
          controlsRef.current.target.set(0, -0.05, 0)
          controlsRef.current.update()
        }
      }
    }
    return () => {
      helperRef.current = null
    }
  }, [camera, controlsRef, helperRef])

  return null
}

// ─── Export Helper ───────────────────────────────────────────
function ExportHelper({ 
  bgColor, 
  bgColor2, 
  isGradient, 
  onReady 
}: { 
  bgColor: string
  bgColor2: string
  isGradient: boolean
  onReady: (fn: () => void) => void 
}) {
  const { gl, scene, camera } = useThree()

  const doExport = useCallback(() => {
    const hiddenObjects: THREE.Object3D[] = []
    
    // Synchronously hide UI helper lines and handles in the Three.js scene graph
    scene.traverse((obj) => {
      if (obj.name === 'safety-area-line' || obj.name === 'decal-3d-handles') {
        if (obj.visible) {
          obj.visible = false
          hiddenObjects.push(obj)
        }
      }
    })

    // Force draw WebGL buffer with hidden handles
    gl.render(scene, camera)

    // Compose the WebGL rendering over a solid/gradient 2D canvas background
    const webglCanvas = gl.domElement
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = webglCanvas.width
    tempCanvas.height = webglCanvas.height
    
    const ctx = tempCanvas.getContext('2d')
    if (ctx) {
      if (isGradient) {
        const grad = ctx.createLinearGradient(0, tempCanvas.height, 0, 0)
        grad.addColorStop(0, bgColor)
        grad.addColorStop(1, bgColor2)
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = bgColor
      }
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
      ctx.drawImage(webglCanvas, 0, 0)
      
      const dataUrl = tempCanvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'mockup-mkr.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    // Restore UI elements visibility synchronously
    hiddenObjects.forEach((obj) => {
      obj.visible = true
    })

    // Render again so UI elements appear back on screen
    gl.render(scene, camera)
  }, [gl, scene, camera, bgColor, bgColor2, isGradient])

  useEffect(() => {
    onReady(doExport)
  }, [doExport, onReady])

  return null
}



// ─── Main MockupViewer Export ────────────────────────────────
const ENV_MAP: Record<MockupState['environment'], string> = {
  studio: 'studio',
  city: 'city',
  sunset: 'sunset',
}

interface Props {
  state: MockupState
  onUpdate: (patch: Partial<MockupState>) => void
  onUpdateLayer: (id: string, patch: Partial<DecalLayer>) => void
  onExportReady?: (fn: (() => void) | null) => void
  isMini?: boolean
}

export function MockupViewer({ state, onUpdate, onUpdateLayer, onExportReady, isMini = false }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraMoving, setIsCameraMoving] = useState(false)
  const cameraHelperRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)

  const directionalLightPosition = useMemo((): [number, number, number] => {
    const angleRad = (state.lightAngle * Math.PI) / 180
    const radius = 5
    const height = 5
    return [
      Math.cos(angleRad) * radius,
      height,
      Math.sin(angleRad) * radius
    ]
  }, [state.lightAngle])

  const handleZoomIn = () => cameraHelperRef.current?.zoomIn()
  const handleZoomOut = () => cameraHelperRef.current?.zoomOut()
  const handleReset = () => cameraHelperRef.current?.reset()
  const handleToggleAutoRotate = () => onUpdate({ autoRotate: !state.autoRotate })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [0, -0.05, 1.8], fov: 32 }}
        style={{
          background: state.isGradient
            ? `linear-gradient(to top, ${state.bgColor}, ${state.bgColor2})`
            : state.bgColor,
          transition: 'background 0.4s'
        }}
      >
        {onExportReady && (
          <ExportHelper 
            bgColor={state.bgColor}
            bgColor2={state.bgColor2}
            isGradient={state.isGradient}
            onReady={fn => onExportReady(() => fn)} 
          />
        )}
        <CameraHandler helperRef={cameraHelperRef} controlsRef={controlsRef} />

        <ambientLight intensity={state.ambientIntensity} />
        <directionalLight 
          position={directionalLightPosition} 
          intensity={state.directionalIntensity} 
          castShadow 
          shadow-mapSize={1024} 
        />
        <directionalLight 
          position={[-directionalLightPosition[0], directionalLightPosition[1], -directionalLightPosition[2]]} 
          intensity={0.3 * (state.ambientIntensity / 0.55)} 
        />

        <Environment preset={ENV_MAP[state.environment] as 'studio' | 'city' | 'sunset'} />

        <color attach="background" args={[state.bgColor]} />

        <Suspense fallback={null}>
          <ShirtMesh 
            state={state} 
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            isCameraMoving={isCameraMoving}
            onUpdateLayer={onUpdateLayer}
            onUpdate={onUpdate}
          />
        </Suspense>

        <ContactShadows position={[0, -0.85, 0]} opacity={0.65} scale={3.5} blur={2.0} far={1.5} />

        <OrbitControls
          ref={controlsRef}
          enabled={!isDragging}
          enablePan={false}
          minDistance={1.1}
          maxDistance={3.5}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
          target={[0, -0.05, 0]}
          onStart={() => setIsCameraMoving(true)}
          onEnd={() => setIsCameraMoving(false)}
        />
      </Canvas>

      {/* Floating UI Overlays */}
      {!isMini && (
        <div className="canvas-zoom-controls">
          <button onClick={handleZoomIn} title="Zoom In">+</button>
          <button onClick={handleZoomOut} title="Zoom Out">-</button>
          <button onClick={handleReset} className="btn-wide" title="Reset View">Reset</button>
          <button 
            onClick={handleToggleAutoRotate} 
            className={`btn-wide ${state.autoRotate ? 'btn-control-active' : ''}`}
            title="Toggle Auto Rotate"
          >
            {state.autoRotate ? '⏸ Auto' : '▶ Auto'}
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('mockup_tour_completed')
              window.location.reload()
            }}
            title="Ver Tutorial"
          >
            💡
          </button>
        </div>
      )}
    </div>
  )
}
