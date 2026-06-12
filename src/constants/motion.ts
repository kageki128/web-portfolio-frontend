import type { CSSProperties } from "react";

type CubicBezier = [number, number, number, number];
type MotionEasingName = "standard" | "enter" | "exit";
type MotionCssVariables = CSSProperties &
  Record<`--motion-ease-${MotionEasingName}`, string>;

export const MOTION_EASING = {
  standard: [0.4, 0, 0.2, 1],
  enter: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
} satisfies Record<MotionEasingName, CubicBezier>;

export const MOTION_DURATION = {
  fast: 0.2,
  standard: 0.3,
  slow: 0.5,
} as const;

function toCssCubicBezier(easing: CubicBezier) {
  return `cubic-bezier(${easing.join(", ")})`;
}

export const MOTION_CSS_VARIABLES: MotionCssVariables = {
  "--motion-ease-standard": toCssCubicBezier(MOTION_EASING.standard),
  "--motion-ease-enter": toCssCubicBezier(MOTION_EASING.enter),
  "--motion-ease-exit": toCssCubicBezier(MOTION_EASING.exit),
};
