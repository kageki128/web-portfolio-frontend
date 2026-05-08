import { SiteBadge } from "./SiteBadge";
import { cn } from "@/lib/cn";

type ThumbnailOverlayBadge = {
  key: string;
  label: string;
  backgroundColor: string;
};

type ThumbnailOverlayVariant = "home" | "about";

type ThumbnailOverlayProps = {
  title: string;
  date?: string;
  badges?: ThumbnailOverlayBadge[];
  variant?: ThumbnailOverlayVariant;
  metaRowClassName?: string;
};

const THUMBNAIL_OVERLAY_VARIANTS: Record<
  ThumbnailOverlayVariant,
  {
    date: string;
    title: string;
  }
> = {
  home: {
    date: "text-slate-200 font-bold text-xs drop-shadow-md",
    title:
      "text-3xl md:text-4xl font-black text-white tracking-tight leading-tight line-clamp-2 break-words drop-shadow-md",
  },
  about: {
    date: "text-slate-200 font-bold text-[10px] drop-shadow-md",
    title:
      "text-2xl md:text-3xl font-black text-white tracking-tight leading-tight line-clamp-2 break-words drop-shadow-md",
  },
};

export function ThumbnailOverlay({
  title,
  date,
  badges = [],
  variant = "home",
  metaRowClassName,
}: ThumbnailOverlayProps) {
  const classes = THUMBNAIL_OVERLAY_VARIANTS[variant];

  return (
    <>
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/95 via-slate-900/35 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col items-start text-left">
        {date || badges.length > 0 ? (
          <div className={cn("flex flex-wrap items-center gap-2 mb-2.5", metaRowClassName)}>
            {date ? <span className={classes.date}>{date}</span> : null}
            {badges.map((badge) => (
              <SiteBadge
                key={badge.key}
                label={badge.label}
                backgroundColor={badge.backgroundColor}
                variant={variant === "home" ? "overlay" : "overlayCompact"}
              />
            ))}
          </div>
        ) : null}
        <h4 className={classes.title}>{title}</h4>
      </div>
    </>
  );
}
