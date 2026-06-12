import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const SITE_BADGE_VARIANT_CLASS = {
  meta: "text-[10px] px-2 py-0.5 shadow-card",
  overlay: "text-xs px-3 py-0.5 shadow-card",
  overlayCompact: "text-[10px] px-2.5 py-0.5 shadow-card",
  tag: "text-xs px-3 py-1",
} as const;

type SiteBadgeVariant = keyof typeof SITE_BADGE_VARIANT_CLASS;

type SiteBadgeProps = {
  label: string;
  backgroundColor: string;
  variant?: SiteBadgeVariant;
  className?: string;
  style?: CSSProperties;
};

export function SiteBadge({
  label,
  backgroundColor,
  variant = "meta",
  className,
  style,
}: SiteBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-badge font-black text-white",
        SITE_BADGE_VARIANT_CLASS[variant],
        className,
      )}
      style={{ backgroundColor, ...style }}
    >
      {label}
    </span>
  );
}
