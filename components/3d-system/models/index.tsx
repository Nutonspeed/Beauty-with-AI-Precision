'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Float,
  PresentationControls,
  Html,
  useProgress
} from '@react-three/drei'
import * as THREE from 'three'

// ==========================================
// Loading Component
// ==========================================
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white text-sm">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  )
}

// ==========================================
// MODEL 1: Product Viewer (Skincare Bottle)
// ==========================================
interface ProductViewerProps {
  className?: string
  autoRotate?: boolean
  showControls?: boolean
}

function SkincareBottle({ color = '#635bff' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Bottle Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 2, 32]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={1}
        />
      </mesh>
      
      {/* Bottle Neck */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 32]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Label */}
      <mesh position={[0, 0.2, 0.51]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}

export function ProductViewer({ 
  className = '', 
  autoRotate = true,
  showControls = true 
}: ProductViewerProps) {
  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
              <SkincareBottle />
            </Float>
          </PresentationControls>
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={5} 
            blur={2.5} 
          />
          
          <Environment preset="studio" />
          
          {showControls && (
            <OrbitControls 
              enableZoom={false}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

// ==========================================
// MODEL 2: Face Model (Abstract Representation)
// ==========================================
interface FaceModelProps {
  className?: string
  showHotspots?: boolean
  onHotspotClick?: (zone: string) => void
}

function AbstractFace({ showHotspots = false, onHotspotClick }: { showHotspots?: boolean, onHotspotClick?: (zone: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  const zones = [
    { id: 'forehead', position: [0, 0.8, 0.5] as [number, number, number], label: 'Forehead' },
    { id: 'cheek-l', position: [-0.5, 0.2, 0.4] as [number, number, number], label: 'Left Cheek' },
    { id: 'cheek-r', position: [0.5, 0.2, 0.4] as [number, number, number], label: 'Right Cheek' },
    { id: 'nose', position: [0, 0.2, 0.6] as [number, number, number], label: 'Nose' },
    { id: 'chin', position: [0, -0.5, 0.4] as [number, number, number], label: 'Chin' },
  ]

  return (
    <group ref={groupRef}>
      {/* Face Base - Oval Shape */}
      <mesh castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#ffdbb5"
          metalness={0}
          roughness={0.6}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Scale to oval */}
      <group scale={[0.85, 1.1, 0.8]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial
            color="#ffdbb5"
            metalness={0}
            roughness={0.6}
            clearcoat={0.3}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
      
      {/* Hotspots */}
      {showHotspots && zones.map((zone) => (
        <mesh
          key={zone.id}
          position={zone.position}
          onClick={() => onHotspotClick?.(zone.id)}
          onPointerEnter={() => setHoveredZone(zone.id)}
          onPointerLeave={() => setHoveredZone(null)}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={hoveredZone === zone.id ? '#22c55e' : '#635bff'}
            emissive={hoveredZone === zone.id ? '#22c55e' : '#635bff'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
          {hoveredZone === zone.id && (
            <Html position={[0, 0.2, 0]} center>
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {zone.label}
              </div>
            </Html>
          )}
        </mesh>
      ))}
    </group>
  )
}

export function FaceModel({ 
  className = '', 
  showHotspots = true,
  onHotspotClick 
}: FaceModelProps) {
  return (
    <div className={`w-full h-[400px] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[-5, 5, 5]} intensity={0.3} color="#ffc0cb" />
          
          <AbstractFace showHotspots={showHotspots} onHotspotClick={onHotspotClick} />
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.3} 
            scale={3} 
            blur={2} 
          />
          
          <Environment preset="apartment" />
          
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ==========================================
// MODEL 3: Geometric Shapes (Decorative)
// ==========================================
interface GeometricShapesProps {
  className?: string
  variant?: 'minimal' | 'complex'
}

function FloatingShapes({ variant = 'minimal' }: { variant?: 'minimal' | 'complex' }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const shapes = variant === 'complex' 
    ? [
        { geo: 'box', pos: [-1.5, 0.5, 0], color: '#635bff', size: 0.5 },
        { geo: 'sphere', pos: [1.5, -0.5, 0.5], color: '#a960ee', size: 0.4 },
        { geo: 'torus', pos: [0, 1, -0.5], color: '#f97316', size: 0.35 },
        { geo: 'cone', pos: [-0.8, -1, 0.3], color: '#22c55e', size: 0.45 },
        { geo: 'octahedron', pos: [1, 0.8, -0.3], color: '#00d4ff', size: 0.4 },
      ]
    : [
        { geo: 'box', pos: [-1, 0, 0], color: '#635bff', size: 0.6 },
        { geo: 'sphere', pos: [1, 0, 0], color: '#a960ee', size: 0.5 },
        { geo: 'torus', pos: [0, 0, 0], color: '#f97316', size: 0.4 },
      ]

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={0.5} floatIntensity={0.3}>
          <mesh position={shape.pos as [number, number, number]} castShadow>
            {shape.geo === 'box' && <boxGeometry args={[shape.size, shape.size, shape.size]} />}
            {shape.geo === 'sphere' && <sphereGeometry args={[shape.size, 32, 32]} />}
            {shape.geo === 'torus' && <torusGeometry args={[shape.size, shape.size * 0.4, 16, 32]} />}
            {shape.geo === 'cone' && <coneGeometry args={[shape.size, shape.size * 1.5, 32]} />}
            {shape.geo === 'octahedron' && <octahedronGeometry args={[shape.size]} />}
            <meshPhysicalMaterial
              color={shape.color}
              metalness={0.3}
              roughness={0.2}
              clearcoat={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export function GeometricShapes({ className = '', variant = 'minimal' }: GeometricShapesProps) {
  return (
    <div className={`w-full h-[300px] ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          
          <FloatingShapes variant={variant} />
          
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ==========================================
// Export All Models
// ==========================================
export default {
  ProductViewer,
  FaceModel,
  GeometricShapes
}
