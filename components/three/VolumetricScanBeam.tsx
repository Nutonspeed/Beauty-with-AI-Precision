"use client";
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fragment = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  void main(){
    float sweep = fract(uTime*0.25);
    float beam = smoothstep(sweep-0.05,sweep,vUv.y) * (1.0 - smoothstep(sweep,sweep+0.05,vUv.y));
    float fadeEdge = smoothstep(0.0,0.15,vUv.x) * smoothstep(1.0,0.85,vUv.x);
    float core = beam * fadeEdge;
    float glow = smoothstep(0.0,0.4,core);
    vec3 col = mix(vec3(0.02,0.02,0.06), uColor, glow);
    float alpha = glow * 0.75;
    if(alpha < 0.02) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const vertex = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

interface BeamProps {
  height?: number;
  radius?: number;
  color?: THREE.ColorRepresentation;
  position?: [number,number,number];
  sweepSpeed?: number;
  opacity?: number;
}

export function VolumetricScanBeam({ height=6, radius=1.4, color='#FF6B9D', position=[0,0,0], sweepSpeed=0.25, opacity=0.75 }: BeamProps){
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((_,dt)=>{ if(matRef.current) matRef.current.uniforms.uTime.value += dt * sweepSpeed; });
  useEffect(()=>{ if(matRef.current) matRef.current.uniforms.uColor.value = new THREE.Color(color); },[color]);
  return (
    <mesh position={position} rotation={[0,0,0]}>
      <cylinderGeometry args={[radius,radius,height,64,1,true]} />
      <shaderMaterial
        ref={matRef}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{ uTime:{ value:0 }, uColor:{ value:new THREE.Color(color) } }}
      />
    </mesh>
  );
}
