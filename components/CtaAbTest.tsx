"use client";
import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getAssignment, trackClick, trackExposureOnce } from "@/lib/ab";
import { useLanguage } from "@/lib/i18n/language-context";

interface Props {
  onPrimary?: () => void;
  onSecondary?: () => void;
  variant?: "A" | "B";
}

export function CtaAbTest({ onPrimary, onSecondary, variant: preassigned }: Props) {
  const { t } = useLanguage();
  const variant = useMemo(() => preassigned ?? getAssignment("cta", ["A", "B"]), [preassigned]);

  useEffect(() => {
    trackExposureOnce("cta", variant);
  }, [variant]);

  const onPrimaryClick = () => {
    trackClick("cta", variant, "primary");
    onPrimary?.();
  };
  const onSecondaryClick = () => {
    trackClick("cta", variant, "secondary");
    onSecondary?.();
  };

  if (variant === "B") {
    return (
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPrimaryClick}
          className="px-9 py-4 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-rose-500 to-purple-600 shadow-[0_10px_30px_-10px_rgba(192,132,252,0.6)] hover:shadow-[0_14px_36px_-12px_rgba(192,132,252,0.6)]"
          aria-label={t.home.startFreeAnalysis}
        >
          {t.home.startFreeAnalysis}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSecondaryClick}
          className="px-8 py-4 rounded-full text-sm font-semibold tracking-wide bg-white/70 backdrop-blur-md border border-rose-200 text-rose-600 shadow-sm hover:bg-white"
          aria-label={t.common.viewFullSystem}
        >
          {t.common.viewFullSystem}
        </motion.button>
        <div className="sr-only" aria-live="polite">CTA Variant B</div>
      </div>
    );
  }

  // Variant A (Control)
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onPrimaryClick}
        className="px-8 py-4 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_8px_28px_-8px_rgba(255,107,157,0.6)] hover:shadow-[0_12px_34px_-10px_rgba(192,132,252,0.55)]"
        aria-label={t.common.startAnalysis}
      >
        {t.common.startAnalysis}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onSecondaryClick}
        className="px-8 py-4 rounded-full text-sm font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-pink-200 text-pink-600 shadow-sm hover:bg-white"
        aria-label={t.common.viewFullSystem}
      >
        {t.common.viewFullSystem}
      </motion.button>
      <div className="sr-only" aria-live="polite">CTA Variant A</div>
    </div>
  );
}
