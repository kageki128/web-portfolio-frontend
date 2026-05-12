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
  isCurrentHeroReady: boolean;
  nextHeroVideoToPreload: string;
  normalizedCurrentSlide: number;
  hasHeroPreviewSources: boolean;
  hasMultipleHeroPreviews: boolean;
  onCurrentVideoCanPlay: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onCurrentVideoLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onPreloadVideoCanPlay: (event: SyntheticEvent<HTMLVideoElement>) => void;
  onPreloadVideoLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) => void;
};

export function useHeroSlideshow(heroPreviewSources: string[]): HeroSlideshowState {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroShuffleSeed, setHeroShuffleSeed] = useState("");
  const [videoReadyBySource, setVideoReadyBySource] = useState<Record<string, boolean>>({});
  const [videoDurationBySource, setVideoDurationBySource] = useState<Record<string, number>>({});
  const heroShuffleSeedRef = useRef("");
  const currentSlideStartedAtRef = useRef(0);
  const startedSlideKeyRef = useRef("");

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
  const isCurrentHeroReady = !currentHeroIsVideo || videoReadyBySource[currentHeroSource] === true;

  const currentVideoDurationSeconds = currentHeroSource
    ? (videoDurationBySource[currentHeroSource] ?? null)
    : null;

  const nextSlide = hasMultipleHeroPreviews
    ? (normalizedCurrentSlide + 1) % heroPreviewSourcesInLoopOrder.length
    : normalizedCurrentSlide;
  const nextHeroSource = hasMultipleHeroPreviews
    ? (heroPreviewSourcesInLoopOrder[nextSlide] ?? "")
    : "";
  const nextHeroIsVideo = hasMultipleHeroPreviews && isVideoPreview(nextHeroSource);
  const nextHeroVideoToPreload = nextHeroIsVideo ? nextHeroSource : "";

  useEffect(() => {
    if (!isCurrentHeroReady) return;
    const slideKey = `${normalizedCurrentSlide}:${currentHeroSource}`;
    if (startedSlideKeyRef.current === slideKey) return;
    startedSlideKeyRef.current = slideKey;
    currentSlideStartedAtRef.current = Date.now();
  }, [currentHeroSource, isCurrentHeroReady, normalizedCurrentSlide]);

  useEffect(() => {
    if (!hasMultipleHeroPreviews) return;
    if (!isCurrentHeroReady) return;

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
      if (nextHeroIsVideo && videoReadyBySource[nextHeroSource] !== true) return;
      setCurrentSlide((prev) => (prev + 1) % heroPreviewSourcesInLoopOrder.length);
    }, remainingMilliseconds);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentHeroIsVideo,
    currentVideoDurationSeconds,
    hasMultipleHeroPreviews,
    heroPreviewSourcesInLoopOrder.length,
    isCurrentHeroReady,
    nextHeroIsVideo,
    nextHeroSource,
    normalizedCurrentSlide,
    videoReadyBySource,
  ]);

  const updateVideoReady = (source: string) => {
    setVideoReadyBySource((prev) => {
      if (prev[source] === true) return prev;
      return {
        ...prev,
        [source]: true,
      };
    });
  };

  const updateVideoDuration = (source: string, durationSeconds: number) => {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;
    setVideoDurationBySource((prev) => {
      if (prev[source] === durationSeconds) return prev;
      return {
        ...prev,
        [source]: durationSeconds,
      };
    });
  };

  const onCurrentVideoCanPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source || source !== currentHeroSource) return;
    updateVideoReady(source);
  };

  const onCurrentVideoLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source || source !== currentHeroSource) return;
    updateVideoDuration(source, event.currentTarget.duration);
  };

  const onPreloadVideoCanPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source) return;
    updateVideoReady(source);
  };

  const onPreloadVideoLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source) return;
    updateVideoDuration(source, event.currentTarget.duration);
  };

  return {
    currentHeroSource,
    currentHeroIsVideo,
    isCurrentHeroReady,
    nextHeroVideoToPreload,
    normalizedCurrentSlide,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onCurrentVideoCanPlay,
    onCurrentVideoLoadedMetadata,
    onPreloadVideoCanPlay,
    onPreloadVideoLoadedMetadata,
  };
}
