"use client";

import React from "react";
import { useScroll, useTransform, useSpring, useReducedMotion, MotionValue } from "framer-motion";

export type MascotMotion = {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  x: MotionValue<string>;
  y: MotionValue<string>;
  rotate: MotionValue<string>;
  scale: MotionValue<number>;
  eyeOffset: MotionValue<number>;
  armWave: MotionValue<number>;
  badgeTopY: MotionValue<number>;
  badgeBottomY: MotionValue<number>;
};

export default function useMascotMotion(): MascotMotion {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.2 });

  const ampShift = prefersReduced ? 0 : 1;

  const x = useTransform(p, [0, 1], ["-10%", "10%"]); // horizontal hover
  const y = useTransform(p, [0, 1], ["0%", `${8 * ampShift}%`]); // vertical bob
  const rotate = useTransform(p, [0, 0.5, 1], ["-4deg", "0deg", "4deg"]);
  const scale = useTransform(p, [0, 1], [1, 1.05]);

  const eyeOffset = useTransform(p, [0, 1], [0, 3 * ampShift]);
  const armWave = useTransform(p, [0, 0.5, 1], [0, -6 * ampShift, 0]);

  const badgeTopY = useTransform(p, [0, 1], [-10 * ampShift, 10 * ampShift]);
  const badgeBottomY = useTransform(p, [0, 1], [6 * ampShift, -6 * ampShift]);

  return { sectionRef, x, y, rotate, scale, eyeOffset, armWave, badgeTopY, badgeBottomY };
}
