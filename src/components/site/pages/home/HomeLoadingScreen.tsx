"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type HomeLoadingScreenProps = {
  onLogoAnimationComplete?: () => void;
};

const LOGO_DRAW_DURATION_SECONDS = 1;
const LOGO_DRAW_EASING = "linear" as const;

export function HomeLoadingScreen({
  onLogoAnimationComplete,
}: HomeLoadingScreenProps) {
  const hasReportedAnimationCompleteRef = useRef(false);
  const logoTextRef = useRef<SVGTextElement>(null);
  const [logoStrokeLength, setLogoStrokeLength] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const measureLogoStrokeLength = () => {
      const length = logoTextRef.current?.getComputedTextLength() ?? 0;
      if (!Number.isFinite(length) || length <= 0) return false;
      if (cancelled) return true;
      setLogoStrokeLength(length);
      return true;
    };

    const measureAfterNextFrame = () => {
      if (measureLogoStrokeLength()) return;
      requestAnimationFrame(() => {
        measureLogoStrokeLength();
      });
    };

    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts.ready.then(() => {
        measureAfterNextFrame();
      });
    } else {
      measureAfterNextFrame();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[120] bg-white flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="ページを準備しています"
    >
      <div className="w-[min(92vw,44rem)]">
        <svg viewBox="0 0 920 220" className="w-full h-auto" aria-hidden="true">
          {logoStrokeLength === null ? (
            <text
              ref={logoTextRef}
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="108"
              fontWeight="700"
              fill="none"
              stroke="rgb(6 182 212)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0"
            >
              kageki128
            </text>
          ) : (
            <motion.text
              key={`logo-stroke:${logoStrokeLength}`}
              ref={logoTextRef}
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="108"
              fontWeight="700"
              fill="none"
              stroke="rgb(6 182 212)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={logoStrokeLength}
              initial={{ strokeDashoffset: logoStrokeLength, opacity: 1 }}
              animate={{
                strokeDashoffset: [logoStrokeLength, 0],
                opacity: [1, 1],
            }}
              transition={{
                duration: LOGO_DRAW_DURATION_SECONDS,
                ease: LOGO_DRAW_EASING,
                times: [0, 1],
              }}
              onAnimationComplete={() => {
                if (hasReportedAnimationCompleteRef.current) return;
                hasReportedAnimationCompleteRef.current = true;
                onLogoAnimationComplete?.();
              }}
            >
              kageki128
            </motion.text>
          )}
        </svg>
      </div>
    </div>
  );
}
