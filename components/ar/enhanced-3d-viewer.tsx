"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, RotateCcw, Move3D } from "lucide-react"

interface Enhanced3DViewerProps {
  imageUrl: string
  landmarks?: Array<{ x: number; y: number; z: number }>
  analysisData?: {
    spots?: Array<{ x: number; y: number; severity: number }>
    pores?: Array<{ x: number; y: number; size: number }>
    wrinkles?: Array<{ points: Array<{ x: number; y: number }> }>
  }
  showHeatmap?: boolean
  treatment?: string
}

// 3D Face Mesh Component
function FaceMesh({ 
  imageUrl, 
  landmarks,
  analysisData,
  showHeatmap 
}: {
  imageUrl: string
  landmarks?: Array<{ x: number; y: number; z: number }>
  analysisData?: Enhanced3DViewerProps['analysisData']
  showHeatmap: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(imageUrl)
  
  // Create face geometry from landmarks
  const geometry = useFaceMeshGeometry(landmarks)
  
  // Rotate mesh slightly for better view
  useFrame((state, delta) => {
    if (meshRef.current && !state.controls) {
      // Subtle idle animation
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  // Create heatmap overlay if needed
  const heatmapTexture = useHeatmapTexture(analysisData, showHeatmap)

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        transparent={showHeatmap}
        roughness={0.7}
        metalness={0.1}
        envMapIntensity={0.5}
      />
      {showHeatmap && heatmapTexture && (
        <meshBasicMaterial 
          map={heatmapTexture} 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      )}
    </mesh>
  )
}

// Hook to create face mesh geometry from MediaPipe landmarks
function useFaceMeshGeometry(landmarks?: Array<{ x: number; y: number; z: number }>) {
  return useRef(() => {
    const geometry = new THREE.BufferGeometry()

    if (!landmarks || landmarks.length === 0) {
      // Fallback: Simple plane for image
      const planeGeometry = new THREE.PlaneGeometry(2, 2, 32, 32)
      return planeGeometry
    }

    // Convert MediaPipe landmarks (478 points) to vertices
    const vertices: number[] = []
    const uvs: number[] = []

    landmarks.forEach((landmark) => {
      // MediaPipe coords: x,y in [0,1], z in depth
      vertices.push(
        (landmark.x - 0.5) * 2,  // Center and scale
        -(landmark.y - 0.5) * 2, // Flip Y and center
        landmark.z * 0.5         // Scale depth
      )
      uvs.push(landmark.x, 1 - landmark.y) // UV for texture mapping
    })

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    // Create faces using Delaunay-like triangulation
    // For now, use simple grid (can be improved with proper face mesh topology)
    const indices = createFaceMeshIndices(landmarks.length)
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }).current()
}

// Create face mesh indices for triangulation
function createFaceMeshIndices(landmarkCount: number): number[] {
  const indices: number[] = []
  
  // Simple grid-based triangulation (simplified)
  // In production, use MediaPipe's actual face mesh topology
  const cols = Math.floor(Math.sqrt(landmarkCount))
  const rows = Math.floor(landmarkCount / cols)

  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const topLeft = row * cols + col
      const topRight = topLeft + 1
      const bottomLeft = (row + 1) * cols + col
      const bottomRight = bottomLeft + 1

      // Two triangles per quad
      indices.push(topLeft, bottomLeft, topRight)
      indices.push(topRight, bottomLeft, bottomRight)
    }
  }

  return indices
}

// Create heatmap texture from analysis data
function useHeatmapTexture(
  analysisData?: Enhanced3DViewerProps['analysisData'],
  show?: boolean
) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!show || !analysisData) {
      setTexture(null)
      return
    }

    // Create canvas for heatmap
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw spots as red circles
    if (analysisData.spots) {
      analysisData.spots.forEach(spot => {
        const x = spot.x * canvas.width
        const y = spot.y * canvas.height
        const radius = spot.severity * 5

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw pores as blue circles
    if (analysisData.pores) {
      analysisData.pores.forEach(pore => {
        const x = pore.x * canvas.width
        const y = pore.y * canvas.height
        const radius = pore.size * 3

        ctx.fillStyle = 'rgba(0, 100, 255, 0.5)'
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw wrinkles as yellow lines
    if (analysisData.wrinkles) {
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)'
      ctx.lineWidth = 2

      analysisData.wrinkles.forEach(wrinkle => {
        ctx.beginPath()
        wrinkle.points.forEach((point, i) => {
          const x = point.x * canvas.width
          const y = point.y * canvas.height
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
    }

    const tex = new THREE.CanvasTexture(canvas)
    setTexture(tex)
  }, [analysisData, show])

  return texture
}

// Enhanced Lighting setup with realistic skin rendering
function Lights() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Key light - main light source (simulates daylight) */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2} 
        color="#fff8f0"
        castShadow
      />
      
      {/* Fill light - softens shadows */}
      <directionalLight 
        position={[-3, 3, -3]} 
        intensity={0.6} 
        color="#e8f4ff"
      />
      
      {/* Back light - adds depth and rim lighting */}
      <directionalLight 
        position={[0, 3, -5]} 
        intensity={0.4} 
        color="#ffffff"
      />
      
      {/* Point lights for facial feature highlights */}
      <pointLight position={[2, 2, 3]} intensity={0.5} color="#fff8f0" distance={10} decay={2} />
      <pointLight position={[-2, 2, 3]} intensity={0.5} color="#fff8f0" distance={10} decay={2} />
      
      {/* Hemisphere light for natural outdoor lighting */}
      <hemisphereLight 
        color="#ffffff" 
        groundColor="#6b7280" 
        intensity={0.3} 
      />
    </>
  )
}

// Main Component
export function Enhanced3DViewer({
  imageUrl,
  landmarks,
  analysisData,
  showHeatmap = false,
  treatment
}: Enhanced3DViewerProps) {
  const [zoom, setZoom] = useState([5])
  const [showGrid, setShowGrid] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap)
  const [rotationSpeed, setRotationSpeed] = useState([2])
  const [lightIntensity, setLightIntensity] = useState([1])
  const controlsRef = useRef<any>(null)

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    setZoom([5])
    setAutoRotate(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Move3D className="h-5 w-5" />
              3D Face Analysis Viewer
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </p>
          </div>
          <Badge variant={landmarks ? "default" : "secondary"}>
            {landmarks ? `${landmarks.length} landmarks` : "2D Mode"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 3D Canvas */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, zoom[0]]} />
            <OrbitControls 
              ref={controlsRef}
              autoRotate={autoRotate}
              autoRotateSpeed={rotationSpeed[0]}
              enableDamping
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={10}
              enablePan={true}
              enableZoom={true}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
            <Lights />
            {showGrid && <gridHelper args={[10, 10]} />}
            
            <Suspense fallback={null}>
              <FaceMesh 
                imageUrl={imageUrl}
                landmarks={landmarks}
                analysisData={analysisData}
                showHeatmap={heatmapVisible}
              />
            </Suspense>
          </Canvas>

          {/* Loading overlay */}
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading 3D model...</p>
              </div>
            </div>
          }>
            <div />
          </Suspense>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Zoom Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Zoom</span>
              <span className="text-muted-foreground">{zoom[0].toFixed(1)}x</span>
            </label>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={2}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Rotation Speed Control */}
          {autoRotate && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Rotation Speed</span>
                <span className="text-muted-foreground">{rotationSpeed[0].toFixed(1)}x</span>
              </label>
              <Slider
                value={rotationSpeed}
                onValueChange={setRotationSpeed}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>
          )}

          {/* Light Intensity Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Lighting</span>
              <span className="text-muted-foreground">{(lightIntensity[0] * 100).toFixed(0)}%</span>
            </label>
            <Slider
              value={lightIntensity}
              onValueChange={setLightIntensity}
              min={0.3}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? "Stop Rotation" : "Auto Rotate"}
            </Button>

            <Button
              variant={heatmapVisible ? "default" : "outline"}
              size="sm"
              onClick={() => setHeatmapVisible(!heatmapVisible)}
              disabled={!analysisData}
            >
              {heatmapVisible ? "Hide" : "Show"} Heatmap
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? "Hide" : "Show"} Grid
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
          </div>
        </div>

        {/* Info */}
        {treatment && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm">
              <span className="font-medium">Treatment Preview:</span> {treatment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
