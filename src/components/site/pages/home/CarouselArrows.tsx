import { ChevronLeft, ChevronRight } from "lucide-react";

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
      ? "absolute left-[12%] sm:left-[18%] lg:left-[23%] xl:left-[28%] top-0 bottom-8 z-20 flex items-center justify-center -translate-x-1/2 pointer-events-none"
      : "absolute right-[12%] sm:right-[18%] lg:right-[23%] xl:right-[28%] top-0 bottom-8 z-20 flex items-center justify-center translate-x-1/2 pointer-events-none";

  return (
    <div className={positioningClassName}>
      <button
        onClick={onClick}
        className="text-slate-300 hover:text-cyan-500 transition-all pointer-events-auto hover:scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        <Icon size={64} strokeWidth={1.5} />
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
