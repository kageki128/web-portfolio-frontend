/* eslint-disable @next/next/no-img-element */
"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";

type MediaPreviewProps = {
  src: string;
  alt: string;
  metadataLink?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
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
  metadataLink = "",
  loading = "lazy",
  fetchPriority = "low",
  decoding = "async",
  className,
  imageClassName,
  placeholderLabel = "No Image",
}: MediaPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [resolvedSource, setResolvedSource] = useState("");
  const [failedBySource, setFailedBySource] = useState<Record<string, true>>({});

  const shouldDeferProvidedSource =
    loading === "lazy" && /^https?:\/\//i.test(src);
  const providedSource =
    !shouldDeferProvidedSource || isNearViewport ? src : "";
  const effectiveSource = hasText(providedSource) ? providedSource : resolvedSource;
  const hasSource = hasText(effectiveSource);
  const hasFailed = hasSource && failedBySource[effectiveSource] === true;
  const shouldShowImage = hasSource && !hasFailed;

  useEffect(() => {
    const shouldResolveMetadata = !hasText(src) && hasText(metadataLink);
    if (!shouldResolveMetadata && !shouldDeferProvidedSource) return;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const resolveImage = async () => {
      if (!shouldResolveMetadata) return;

      const metadata = await fetchLinkMetadata(metadataLink, {
        includeTitle: false,
        includeImage: true,
      });
      if (!cancelled && hasText(metadata.image)) {
        setResolvedSource(metadata.image);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setIsNearViewport(true);
        void resolveImage();
      },
      {
        rootMargin: shouldResolveMetadata ? "800px 0px" : "200px 0px",
      },
    );

    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [metadataLink, shouldDeferProvidedSource, src]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden bg-surface", className)}
    >
      {shouldShowImage ? (
        <img
          src={effectiveSource}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => {
            if (!hasSource) {
              return;
            }
            setFailedBySource((prev) =>
              prev[effectiveSource] ? prev : { ...prev, [effectiveSource]: true },
            );
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
