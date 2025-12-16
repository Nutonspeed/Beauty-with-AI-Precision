"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Particles } from "./particles";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

export const GL = ({
  hovering,
  className,
}: {
  hovering: boolean;
  className?: string;
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl2 = canvas.getContext("webgl2");
      if (!gl2) {
        setIsSupported(false);
        return;
      }

      const hasFloat =
        !!gl2.getExtension("EXT_color_buffer_float") ||
        !!gl2.getExtension("WEBGL_color_buffer_float");
      const hasFloatLinear = !!gl2.getExtension("OES_texture_float_linear");

      setIsSupported(hasFloat && hasFloatLinear);
    } catch {
      setIsSupported(false);
    }
  }, []);

  const initialSize = useMemo(() => {
    if (typeof window === "undefined") return 512;

    const w = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency || 8;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (reducedMotion) return 256;
    if (w < 768) return 256;
    if (dpr >= 2) return 256;
    if (typeof mem === "number" && mem <= 4) return 256;
    if (cores <= 4) return 256;

    return 512;
  }, []);

  const speed = 1.0;
  const noiseScale = 0.6;
  const noiseIntensity = 0.52;
  const timeScale = 1;
  const focus = 3.8;
  const aperture = 1.79;
  const pointSize = 10.0;
  const opacity = 0.8;
  const planeScale = 10.0;
  const size = initialSize;
  const vignetteDarkness = 1.5;
  const vignetteOffset = 0.4;
  const bloomIntensity = 0.25;
  const bloomLuminanceThreshold = 0.1;
  const bloomRadius = 0.35;
  const useManualTime = false;
  const manualTime = 0;

  if (isSupported === false) {
    return null;
  }

  if (isSupported === null) {
    return null;
  }

  return (
    <div id="webgl" className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: [
            1.2629783123314589, 2.664606471394044, -1.8178993743288914,
          ],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000"]} />
        <Particles
          speed={speed}
          aperture={aperture}
          focus={focus}
          size={size}
          noiseScale={noiseScale}
          noiseIntensity={noiseIntensity}
          timeScale={timeScale}
          pointSize={pointSize}
          opacity={opacity}
          planeScale={planeScale}
          useManualTime={useManualTime}
          manualTime={manualTime}
          introspect={hovering}
        />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={hovering ? bloomIntensity * 1.75 : bloomIntensity}
            luminanceThreshold={bloomLuminanceThreshold}
            radius={bloomRadius}
          />
          <Vignette offset={vignetteOffset} darkness={vignetteDarkness} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
