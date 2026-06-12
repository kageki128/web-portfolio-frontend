/* eslint-disable @next/next/no-img-element */
"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { hasText } from "@/lib/text";

type MediaPreviewProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
  className?: string;
  imageClassName?: string;
  placeholderLabel?: string;
};

const PLACEHOLDER_CLASS =
  "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface text-muted";

export function MediaPreview({
  src,
  alt,
  loading = "lazy",
  decoding = "async",
  className,
  imageClassName,
  placeholderLabel = "No Image",
}: MediaPreviewProps) {
  const [failedBySource, setFailedBySource] = useState<Record<string, true>>({});

  const hasSource = hasText(src);
  const hasFailed = hasSource && failedBySource[src] === true;
  const shouldShowImage = hasSource && !hasFailed;

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => {
            if (!hasSource) {
              return;
            }
            setFailedBySource((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
          }}
        />
      ) : (
        <div className={PLACEHOLDER_CLASS} aria-hidden="true">
          <ImageOff size={22} />
          <span className="text-xs font-bold tracking-wide uppercase">{placeholderLabel}</span>
        </div>
      )}
    </div>
  );
}
