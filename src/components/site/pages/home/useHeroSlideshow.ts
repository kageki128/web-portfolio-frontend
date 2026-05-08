import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  createLoopOrder,
  HERO_MAX_DISPLAY_MILLISECONDS,
  isVideoPreview,
  resolveVideoDisplayMilliseconds,
} from "./heroUtils";

const HERO_MIN_DISPLAY_MILLISECONDS = 150;

type HeroSlideshowState = {
  currentHeroSource: string;
  currentHeroIsVideo: boolean;
  normalizedCurrentSlide: number;
  hasHeroPreviewSources: boolean;
  hasMultipleHeroPreviews: boolean;
  onVideoLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) => void;
};

export function useHeroSlideshow(heroPreviewSources: string[]): HeroSlideshowState {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroShuffleSeed, setHeroShuffleSeed] = useState("");
  const [videoDurationBySource, setVideoDurationBySource] = useState<Record<string, number>>({});
  const heroShuffleSeedRef = useRef("");
  const currentSlideStartedAtRef = useRef(0);
  const currentHeroSourceRef = useRef("");

  useEffect(() => {
    if (heroShuffleSeedRef.current) return;
    heroShuffleSeedRef.current = crypto.randomUUID();
    setHeroShuffleSeed(heroShuffleSeedRef.current);
  }, []);

  const heroPreviewSourcesInLoopOrder = useMemo(
    () => createLoopOrder(heroPreviewSources, heroShuffleSeed),
    [heroPreviewSources, heroShuffleSeed],
  );

  const hasHeroPreviewSources = heroPreviewSourcesInLoopOrder.length > 0;
  const hasMultipleHeroPreviews = heroPreviewSourcesInLoopOrder.length > 1;

  const normalizedCurrentSlide = hasHeroPreviewSources
    ? currentSlide % heroPreviewSourcesInLoopOrder.length
    : 0;

  const currentHeroSource = hasHeroPreviewSources
    ? heroPreviewSourcesInLoopOrder[normalizedCurrentSlide] ?? ""
    : "";

  const currentHeroIsVideo = hasHeroPreviewSources && isVideoPreview(currentHeroSource);

  const currentVideoDurationSeconds = currentHeroSource
    ? (videoDurationBySource[currentHeroSource] ?? null)
    : null;

  useEffect(() => {
    currentHeroSourceRef.current = currentHeroSource;
  }, [currentHeroSource]);

  useEffect(() => {
    if (!hasMultipleHeroPreviews) return;
    currentSlideStartedAtRef.current = Date.now();
  }, [hasMultipleHeroPreviews, normalizedCurrentSlide]);

  useEffect(() => {
    if (!hasMultipleHeroPreviews) return;

    const slideStartAt = currentSlideStartedAtRef.current;
    const elapsedMilliseconds = slideStartAt > 0 ? Date.now() - slideStartAt : 0;
    const targetDisplayMilliseconds =
      currentHeroIsVideo && currentVideoDurationSeconds !== null
        ? resolveVideoDisplayMilliseconds(currentVideoDurationSeconds)
        : HERO_MAX_DISPLAY_MILLISECONDS;

    const remainingMilliseconds = Math.max(
      HERO_MIN_DISPLAY_MILLISECONDS,
      targetDisplayMilliseconds - elapsedMilliseconds,
    );

    const timeoutId = window.setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPreviewSourcesInLoopOrder.length);
    }, remainingMilliseconds);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentHeroIsVideo,
    currentVideoDurationSeconds,
    hasMultipleHeroPreviews,
    heroPreviewSourcesInLoopOrder.length,
    normalizedCurrentSlide,
  ]);

  const onVideoLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source || source !== currentHeroSourceRef.current) return;

    const durationSeconds = event.currentTarget.duration;
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

    setVideoDurationBySource((prev) => {
      if (prev[source] === durationSeconds) return prev;
      return {
        ...prev,
        [source]: durationSeconds,
      };
    });
  };

  return {
    currentHeroSource,
    currentHeroIsVideo,
    normalizedCurrentSlide,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onVideoLoadedMetadata,
  };
}
