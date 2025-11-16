# Mascot Component

An SVG + Framer Motion mascot tuned for the Beauty-with-AI-Precision theme.

## Files
- `index.tsx` — Section wrapper (sticky), glow orbs, floating badges, in-view gating.
- `MascotSVG.tsx` — Vector layers (body/head/eyes/arms/badge). Eyes and left arm are motion-driven.
- `useMascotMotion.ts` — Motion values (scroll spring, parallax, eye tracking, wave, reduced-motion handling).

## Usage
```tsx
import Mascot from "./components/mascot";

// In page layout
<Mascot />

// Optional variant prop (future support for rive/lottie)
<Mascot variant="svg" />
```

## Notes

- Uses `useInView` to avoid rendering when offscreen.
- Respects `prefers-reduced-motion` via Framer Motion `useReducedMotion`.
- Keep transforms GPU-friendly (translate/scale/rotate) and avoid heavy SVG filters for mobile.

## Future Variants

- Variant prop available: `variant="svg" | "rive" | "lottie"` (svg is default).
- For rive/lottie, add dynamic import (`ssr:false`) and IO preloading in a follow-up.
- Provide prop for amplitude tuning and disabling badges on mobile.
