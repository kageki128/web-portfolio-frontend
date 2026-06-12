import { useEffect, useRef } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

type ShapeKind = "circle" | "square" | "cross" | "triangle";

type FloatingShape = {
  id: number;
  kind: ShapeKind;
  top: string;
  left: string;
  size: number;
  colorIndex: number;
  rotation: number;
  isFilled: boolean;
  isSlowLayer: boolean;
};

const SHAPE_TEXT_COLORS = [
  "text-brand-400/40",
  "text-indigo-400/40",
  "text-fuchsia-400/40",
  "text-emerald-400/40",
  "text-subtle/50",
  "text-blue-400/40",
] as const;

const SHAPE_KINDS = ["circle", "square", "cross", "triangle"] as const;
const FLOATING_SHAPE_COUNT = 84;
const FLOATING_SHAPE_AREA_HEIGHT_VH = 1000;
const FLOATING_SHAPE_SEED = 47;

function createMulberry32(seed: number) {
  let t = seed;

  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const FLOATING_SHAPES: FloatingShape[] = (() => {
  const random = createMulberry32(FLOATING_SHAPE_SEED);
  const bandHeight = FLOATING_SHAPE_AREA_HEIGHT_VH / FLOATING_SHAPE_COUNT;

  return Array.from({ length: FLOATING_SHAPE_COUNT }, (_, index) => ({
    id: index,
    kind: SHAPE_KINDS[Math.floor(random() * SHAPE_KINDS.length)],
    top: `${(index * bandHeight + random() * bandHeight).toFixed(2)}vh`,
    left: `${(random() * 100).toFixed(2)}%`,
    size: Math.round(24 + random() * 96),
    colorIndex: Math.floor(random() * SHAPE_TEXT_COLORS.length),
    rotation: Math.round(random() * 360),
    isFilled: random() > 0.33,
    isSlowLayer: random() > 0.5,
  }));
})();

const SLOW_LAYER_SHAPES = FLOATING_SHAPES.filter((shape) => shape.isSlowLayer);
const FAST_LAYER_SHAPES = FLOATING_SHAPES.filter((shape) => !shape.isSlowLayer);

function ShapeIcon({ shape, isFastLayer }: { shape: FloatingShape; isFastLayer: boolean }) {
  const size = isFastLayer ? shape.size * 1.5 : shape.size;
  const strokeWidth = isFastLayer ? "4" : "6";
  const commonProps = {
    fill: shape.isFilled ? "currentColor" : "none",
    stroke: shape.isFilled ? "none" : "currentColor",
    strokeWidth: shape.isFilled ? "0" : strokeWidth,
    strokeLinejoin: "round" as const,
    className: SHAPE_TEXT_COLORS[shape.colorIndex],
  };

  if (shape.kind === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <circle cx="50" cy="50" r="40" {...commonProps} />
      </svg>
    );
  }

  if (shape.kind === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <rect x="15" y="15" width="70" height="70" {...commonProps} />
      </svg>
    );
  }

  if (shape.kind === "cross") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
        <path
          d="M40,15 h20 v25 h25 v20 h-25 v25 h-20 v-25 h-25 v-20 h25 z"
          {...commonProps}
        />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      <polygon points="50,15 85,80 15,80" {...commonProps} />
    </svg>
  );
}

function FloatingShapeLayer({
  shapes,
  isFastLayer,
  y,
  opacityClassName,
}: {
  shapes: FloatingShape[];
  isFastLayer: boolean;
  y: MotionValue<number>;
  opacityClassName: string;
}) {
  return (
    <motion.div
      style={{ y, height: `${FLOATING_SHAPE_AREA_HEIGHT_VH}vh` }}
      className={`absolute top-0 left-0 w-full ${opacityClassName}`}
    >
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute flex items-center justify-center ${isFastLayer ? "" : "blur-[2px]"}`}
          style={{
            top: shape.top,
            left: shape.left,
            transform: `rotate(${shape.rotation}deg)`,
          }}
        >
          <ShapeIcon shape={shape} isFastLayer={isFastLayer} />
        </div>
      ))}
    </motion.div>
  );
}

export function ParallaxBackground() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const ySlowTarget = useTransform(scrollY, (scrollPosition) => scrollPosition * -0.3);
  const yFastTarget = useTransform(scrollY, (scrollPosition) => scrollPosition * -0.7);
  const ySlow = useSpring(ySlowTarget, { stiffness: 90, damping: 20, mass: 0.6 });
  const yFast = useSpring(yFastTarget, { stiffness: 110, damping: 18, mass: 0.45 });
  const isInitialPositionSynced = useRef(false);

  useEffect(() => {
    if (isInitialPositionSynced.current) return;

    const syncToCurrentPosition = () => {
      if (isInitialPositionSynced.current) return;
      ySlow.jump(ySlowTarget.get());
      yFast.jump(yFastTarget.get());
      isInitialPositionSynced.current = true;
    };

    syncToCurrentPosition();

    // ブラウザのスクロール復元が遅れて適用されるケースにも合わせる。
    let rafId = requestAnimationFrame(syncToCurrentPosition);
    const timeoutId = window.setTimeout(() => {
      rafId = requestAnimationFrame(syncToCurrentPosition);
    }, 0);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [yFast, yFastTarget, ySlow, ySlowTarget]);

  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingShapeLayer
          shapes={SLOW_LAYER_SHAPES}
          isFastLayer={false}
          y={ySlow}
          opacityClassName="opacity-50"
        />
        <FloatingShapeLayer
          shapes={FAST_LAYER_SHAPES}
          isFastLayer
          y={yFast}
          opacityClassName="hidden md:block opacity-70"
        />
      </div>
    </>
  );
}
