import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_ACTION_CLASS } from "@/constants/siteStyles";
import { cn } from "@/lib/cn";

type ArrowProps = {
  onClick?: () => void;
};

function ArrowButton({
  onClick,
  side,
  icon: Icon,
}: {
  onClick?: () => void;
  side: "left" | "right";
  icon: typeof ChevronLeft | typeof ChevronRight;
}) {
  const positioningClassName =
    side === "left"
      ? "pointer-events-none absolute top-0 bottom-8 z-20 hidden -translate-x-1/2 items-center justify-center sm:flex"
      : "pointer-events-none absolute top-0 bottom-8 z-20 hidden translate-x-1/2 items-center justify-center sm:flex";
  const positionStyle =
    side === "left"
      ? { left: "max(1rem, calc((100vw - 56rem) / 2))" }
      : { right: "max(1rem, calc((100vw - 56rem) / 2))" };

  return (
    <div className={positioningClassName} style={positionStyle}>
      <button
        type="button"
        onClick={onClick}
        aria-label={side === "left" ? "前のスライド" : "次のスライド"}
        className={cn(
          ICON_ACTION_CLASS,
          "pointer-events-auto h-14 w-14 text-faint hover:scale-110 hover:text-brand-500",
        )}
        style={{
          filter:
            "drop-shadow(0 0 8px color-mix(in srgb, var(--color-white) 80%, transparent))",
        }}
      >
        <Icon size={56} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function NextArrow({ onClick }: ArrowProps) {
  return <ArrowButton onClick={onClick} side="right" icon={ChevronRight} />;
}

export function PrevArrow({ onClick }: ArrowProps) {
  return <ArrowButton onClick={onClick} side="left" icon={ChevronLeft} />;
}
