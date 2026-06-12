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
  nextHeroSource: string;
  isCurrentHeroReady: boolean;
  hasHeroPreviewSources: boolean;
  hasMultipleHeroPreviews: boolean;
  onHeroMediaReady: (
    event: SyntheticEvent<HTMLVideoElement | HTMLImageElement>,
  ) => void;
  onHeroVideoLoadedMetadata: (
    event: SyntheticEvent<HTMLVideoElement>,
  ) => void;
};

export function useHeroSlideshow(
  heroPreviewSources: string[],
  heroShuffleSeed: string,
): HeroSlideshowState {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readyBySource, setReadyBySource] = useState<Record<string, boolean>>({});
  const [videoDurationBySource, setVideoDurationBySource] = useState<
    Record<string, number>
  >({});
  const currentSlideTimingRef = useRef({ source: "", startedAt: 0 });

  const heroPreviewSourcesInLoopOrder = useMemo(
    () => createLoopOrder(heroPreviewSources, heroShuffleSeed),
    [heroPreviewSources, heroShuffleSeed],
  );

  const hasHeroPreviewSources = heroPreviewSourcesInLoopOrder.length > 0;
  const hasMultipleHeroPreviews = heroPreviewSourcesInLoopOrder.length > 1;
  const normalizedCurrentSlide = hasHeroPreviewSources
    ? currentSlide % heroPreviewSourcesInLoopOrder.length
    : 0;
  const nextSlide = hasMultipleHeroPreviews
    ? (normalizedCurrentSlide + 1) % heroPreviewSourcesInLoopOrder.length
    : normalizedCurrentSlide;
  const currentHeroSource = hasHeroPreviewSources
    ? (heroPreviewSourcesInLoopOrder[normalizedCurrentSlide] ?? "")
    : "";
  const nextHeroSource = hasMultipleHeroPreviews
    ? (heroPreviewSourcesInLoopOrder[nextSlide] ?? "")
    : "";
  const isCurrentHeroReady =
    currentHeroSource.length > 0 && readyBySource[currentHeroSource] === true;
  const isNextHeroReady =
    nextHeroSource.length > 0 && readyBySource[nextHeroSource] === true;

  useEffect(() => {
    if (!hasMultipleHeroPreviews || !isCurrentHeroReady) return;

    if (currentSlideTimingRef.current.source !== currentHeroSource) {
      currentSlideTimingRef.current = {
        source: currentHeroSource,
        startedAt: Date.now(),
      };
    }

    const durationSeconds = videoDurationBySource[currentHeroSource] ?? null;
    const targetDisplayMilliseconds =
      isVideoPreview(currentHeroSource) && durationSeconds !== null
        ? resolveVideoDisplayMilliseconds(durationSeconds)
        : HERO_MAX_DISPLAY_MILLISECONDS;
    const elapsedMilliseconds =
      Date.now() - currentSlideTimingRef.current.startedAt;
    const remainingMilliseconds = Math.max(
      HERO_MIN_DISPLAY_MILLISECONDS,
      targetDisplayMilliseconds - elapsedMilliseconds,
    );

    const timeoutId = window.setTimeout(() => {
      if (!isNextHeroReady) return;

      setCurrentSlide(
        (previousSlide) =>
          (previousSlide + 1) % heroPreviewSourcesInLoopOrder.length,
      );
    }, remainingMilliseconds);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentHeroSource,
    heroPreviewSourcesInLoopOrder.length,
    hasMultipleHeroPreviews,
    isCurrentHeroReady,
    isNextHeroReady,
    videoDurationBySource,
  ]);

  const onHeroMediaReady = (
    event: SyntheticEvent<HTMLVideoElement | HTMLImageElement>,
  ) => {
    const source = event.currentTarget.getAttribute("src");
    if (!source) return;

    setReadyBySource((previousState) =>
      previousState[source] === true
        ? previousState
        : { ...previousState, [source]: true },
    );
  };

  const onHeroVideoLoadedMetadata = (
    event: SyntheticEvent<HTMLVideoElement>,
  ) => {
    const source = event.currentTarget.getAttribute("src");
    const durationSeconds = event.currentTarget.duration;
    if (
      !source ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0
    ) {
      return;
    }

    setVideoDurationBySource((previousState) =>
      previousState[source] === durationSeconds
        ? previousState
        : { ...previousState, [source]: durationSeconds },
    );
  };

  return {
    currentHeroSource,
    nextHeroSource,
    isCurrentHeroReady,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onHeroMediaReady,
    onHeroVideoLoadedMetadata,
  };
}
