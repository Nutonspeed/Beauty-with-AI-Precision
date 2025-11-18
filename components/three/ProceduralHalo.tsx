"use client";
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertex = /* glsl */`
  varying vec3 vPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDistortScale;
  // Simple 3D noise (value noise) helpers
  float hash(vec3 p){
    p = vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));
    return fract(sin(p.x+p.y+p.z)*43758.5453);
  }
  float noise(vec3 p){
    vec3 i=floor(p); vec3 f=fract(p);
    float n= mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    return n;
  }
  void main(){
    vUv = uv;
    vPos = position;
    float n = noise(normal*1.5 + vec3(uTime*0.25));
    float inflate = (n*2.0-1.0) * uDistortScale;
    vec3 transformed = position + normal * inflate;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.0);
  }
`;

const fragment = /* glsl */`
  varying vec3 vPos;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uOpacity;
  void main(){
    float r = length(vPos.xy);
    float edge = smoothstep(0.0,1.0,r*0.5);
    vec3 col = mix(uColorInner,uColorOuter,edge);
    float pulse = 0.55 + 0.45*sin(uTime*0.6 + r*1.2);
    float alpha = (1.0-edge)*uOpacity * pulse;
    if(alpha < 0.02) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface HaloProps {
  radius?: number;
  innerColor?: THREE.ColorRepresentation;
  outerColor?: THREE.ColorRepresentation;
  distortScale?: number;
  opacity?: number;
  speed?: number;
  position?: [number,number,number];
  intensity?: number; // additional glow intensity multiplier
}

export function ProceduralHalo({
  radius=2.2,
  innerColor='#FF6B9D',
  outerColor='#C084FC',
  distortScale=0.35,
  opacity=0.85,
  speed=1,
  position=[0,0,0],
  intensity=1
}: HaloProps){
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((_,dt)=>{
    if(matRef.current){
      matRef.current.uniforms.uTime.value += dt*speed;
      // Smooth uniform updates (lerp)
      const currentDistort = matRef.current.uniforms.uDistortScale.value as number;
      matRef.current.uniforms.uDistortScale.value = THREE.MathUtils.lerp(currentDistort, distortScale, 0.08);
      const currentOpacity = matRef.current.uniforms.uOpacity.value as number;
      matRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(currentOpacity, opacity, 0.1);
    }
  });
  useEffect(()=>{
    if(matRef.current){
      matRef.current.uniforms.uColorInner.value = new THREE.Color(innerColor);
      matRef.current.uniforms.uColorOuter.value = new THREE.Color(outerColor);
    }
  },[innerColor, outerColor]);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius,96,96]} />
        <shaderMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={{
            uTime:{ value:0 },
            uDistortScale:{ value:distortScale },
            uColorInner:{ value:new THREE.Color(innerColor) },
            uColorOuter:{ value:new THREE.Color(outerColor) },
            uOpacity:{ value:opacity * intensity }
          }}
        />
      </mesh>
    </group>
  );
}
