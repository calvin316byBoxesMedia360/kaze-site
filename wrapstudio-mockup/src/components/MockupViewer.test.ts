import { describe, it, expect } from 'vitest'
import { calculateDecalOffset, classifyRegion } from './MockupViewer'
import { clampDecalPosition } from '../App'

describe('UV Raycasting Decal Position Mapping', () => {
  const meshWidth = 1.8
  const meshHeight = 2.2

  it('maps center UV (0.5, 0.5) to local offset (0, 0)', () => {
    const { offsetX, offsetY } = calculateDecalOffset(0.5, 0.5, meshWidth, meshHeight)
    expect(offsetX).toBeCloseTo(0.0)
    expect(offsetY).toBeCloseTo(0.0)
  })

  it('maps top-right UV (1.0, 1.0) to local offset (width/2, height/2)', () => {
    const { offsetX, offsetY } = calculateDecalOffset(1.0, 1.0, meshWidth, meshHeight)
    expect(offsetX).toBeCloseTo(meshWidth / 2)
    expect(offsetY).toBeCloseTo(meshHeight / 2)
  })

  it('maps bottom-left UV (0.0, 0.0) to local offset (-width/2, -height/2)', () => {
    const { offsetX, offsetY } = calculateDecalOffset(0.0, 0.0, meshWidth, meshHeight)
    expect(offsetX).toBeCloseTo(-meshWidth / 2)
    expect(offsetY).toBeCloseTo(-meshHeight / 2)
  })

  it('maps custom UV coordinates correctly', () => {
    const { offsetX, offsetY } = calculateDecalOffset(0.75, 0.25, meshWidth, meshHeight)
    expect(offsetX).toBeCloseTo(0.45)
    expect(offsetY).toBeCloseTo(-0.55)
  })

  it('applies calibration factors correctly', () => {
    const calibX = 0.8
    const calibY = 1.2
    const { offsetX, offsetY } = calculateDecalOffset(0.8, 0.6, meshWidth, meshHeight, calibX, calibY)
    expect(offsetX).toBeCloseTo(0.432)
    expect(offsetY).toBeCloseTo(0.264)
  })
})

describe('3D Local Point Region Classification', () => {
  it('classifies center-front points correctly', () => {
    // x is between -0.35 and 0.35, z is positive
    const region = classifyRegion(0.0, 0.2)
    expect(region).toBe('front')
  })

  it('classifies center-back points correctly', () => {
    // x is between -0.35 and 0.35, z is negative
    const region = classifyRegion(0.1, -0.15)
    expect(region).toBe('back')
  })

  it('classifies left-sleeve points correctly (positive X)', () => {
    // x is greater than 0.35
    const region1 = classifyRegion(0.4, 0.0)
    const region2 = classifyRegion(0.6, 0.1)
    expect(region1).toBe('left-sleeve')
    expect(region2).toBe('left-sleeve')
  })

  it('classifies right-sleeve points correctly (negative X)', () => {
    // x is less than -0.35
    const region1 = classifyRegion(-0.4, 0.0)
    const region2 = classifyRegion(-0.55, -0.2)
    expect(region1).toBe('right-sleeve')
    expect(region2).toBe('right-sleeve')
  })

  it('handles border values correctly', () => {
    // exactly 0.35 is on the border, let's verify x boundaries
    expect(classifyRegion(0.35, 0.1)).toBe('front') // x not > 0.35
    expect(classifyRegion(0.351, 0.1)).toBe('left-sleeve') // x > 0.35
    
    expect(classifyRegion(-0.35, -0.1)).toBe('back') // x not < -0.35
    expect(classifyRegion(-0.351, -0.1)).toBe('right-sleeve') // x < -0.35
  })
})

describe('Decal Safety Area Clamping', () => {
  it('clamps torso coordinates properly at standard scale', () => {
    // scale = 0.3, halfSize = 0.0675
    // limitX = 0.12 - 0.0675 = 0.0525
    // limitYMin = -0.25 + 0.0675 = -0.1825
    // limitYMax = 0.15 - 0.0675 = 0.0825
    const pos = clampDecalPosition('front', 0.1, 0.3, 0.3)
    expect(pos.offsetX).toBeCloseTo(0.0525)
    expect(pos.offsetY).toBeCloseTo(0.0825)
  })

  it('clamps torso coordinates and allows centered coordinates', () => {
    const pos = clampDecalPosition('front', 0.01, 0.05, 0.3)
    expect(pos.offsetX).toBeCloseTo(0.01)
    expect(pos.offsetY).toBeCloseTo(0.05)
  })

  it('handles optional scale parameter defaulting to 0.3', () => {
    const pos = clampDecalPosition('front', 0.1, 0.3)
    expect(pos.offsetX).toBeCloseTo(0.0525)
    expect(pos.offsetY).toBeCloseTo(0.0825)
  })

  it('clamps sleeve coordinates correctly', () => {
    // scale = 0.15, halfSize = 0.03375
    // limitX = 0.05 - 0.03375 = 0.01625
    // limitY = 0.10 - 0.03375 = 0.06625
    const pos = clampDecalPosition('left-sleeve', 0.05, -0.09, 0.15)
    expect(pos.offsetX).toBeCloseTo(0.01625)
    expect(pos.offsetY).toBeCloseTo(-0.06625)
  })
})

