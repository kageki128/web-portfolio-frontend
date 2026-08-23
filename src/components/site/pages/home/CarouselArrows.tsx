import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_ACTION_CLASS } from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
import { HOME_CAROUSEL_MAX_WIDTH } from "./carouselLayout";

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
      ? { left: `max(1rem, calc((100% - ${HOME_CAROUSEL_MAX_WIDTH}) / 2))` }
      : { right: `max(1rem, calc((100% - ${HOME_CAROUSEL_MAX_WIDTH}) / 2))` };

  return (
    <div className={positioningClassName} style={positionStyle}>
      <button
        type="button"
        onClick={onClick}
        aria-label={side === "left" ? "前のスライド" : "次のスライド"}
        className={cn(
          ICON_ACTION_CLASS,
          "pointer-events-auto h-12 w-12 border border-line bg-surface/90 text-body shadow-floating backdrop-blur-sm hover:scale-105 hover:border-brand-500 hover:bg-brand-500 hover:text-white",
        )}
      >
        <Icon size={24} strokeWidth={2} />
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
