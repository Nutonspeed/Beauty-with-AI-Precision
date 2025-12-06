'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define model types
type ModelType = 'face' | 'product' | 'treatment';

// Model configurations
const MODEL_CONFIG = {
  face: {
    path: '/models/face/face-model.glb',
    scale: 1.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  product: {
    path: '/models/products/product-sample.glb',
    scale: 0.5,
    position: [0, -1, 0],
    rotation: [0, Math.PI / 4, 0],
  },
  treatment: {
    path: '/models/treatments/treatment-sample.glb',
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
};

// 3D Face Model Component
function FaceModel() {
  return (
    <group>
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>

      {/* Eyes */}
      <mesh castShadow position={[-0.3, 0.1, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh castShadow position={[0.3, 0.1, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh castShadow position={[0, -0.1, 1]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.1, 0.4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mouth */}
      <mesh castShadow position={[0, -0.4, 0.7]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Product Model Component
function ProductModel() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
    </group>
  );
}

// Treatment Model Component
function TreatmentModel() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          transparent 
          opacity={0.7}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// 3D Model Component
function Model({ modelType }: { modelType: ModelType }) {
  return (
    <>
      {modelType === 'face' && <FaceModel />}
      {modelType === 'product' && <ProductModel />}
      {modelType === 'treatment' && <TreatmentModel />}
    </>
  );
}

// Model Viewer Component
function ModelViewer({ modelType }: { modelType: ModelType }) {
  const config = MODEL_CONFIG[modelType];
  
  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Model modelType={modelType} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={5}
        />
        <Environment preset="sunset" background />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        {modelType.toUpperCase()} Model
      </div>
    </div>
  );
}

// Main Model Manager Component
export function ModelManager() {
  const [activeModel, setActiveModel] = useState<ModelType>('face');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>3D Model Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="face" 
          className="w-full"
          onValueChange={(value) => setActiveModel(value as ModelType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="face">Face</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeModel} className="mt-4">
            <ModelViewer modelType={activeModel} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Use your mouse to rotate, scroll to zoom, and right-click to pan the 3D model.</p>
        </div>
      </CardContent>
    </Card>
  );
}

