/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import { MediaPreview } from "../MediaPreview";
import { SectionTitle } from "../SectionTitle";
import { ThumbnailOverlay } from "../ThumbnailOverlay";
import { OutlineActionLink } from "../OutlineActionLink";
import {
  shouldDeferAchievementNotificationForExternalClick,
  useAchievements,
} from "../achievements/AchievementProvider";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import {
  ARTICLE_PLATFORM_COLORS,
  getWorkTagThemeColor,
} from "@/constants/colors";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import { MOTION_DURATION, MOTION_EASING } from "@/constants/motion";
import {
  MEDIA_CARD_CLASS,
  PAGE_CONTAINER_CLASS,
  PROFILE_ID_CLASS,
} from "@/constants/siteStyles";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import { isExternalLink } from "@/lib/url";
import { createWorkDetailHref } from "@/lib/workLink";
import type { ArticleItem } from "@/types/articles";
import type { WorkItem } from "@/types/works";
import { HERO_FADE_SECONDS, isVideoPreview } from "./home/heroUtils";
import { HomeLoadingScreen } from "./home/HomeLoadingScreen";
import { createCenterCarouselSettings } from "./home/sliderSettings";
import { useHeroSlideshow } from "./home/useHeroSlideshow";

type HomePageProps = {
  heroPreviewSources: string[];
  heroShuffleSeed: string;
  heroProfileName: string;
  heroProfileId: string;
  heroIntroduction: string;
  featuredWorks: Pick<
    WorkItem,
    "id" | "title" | "date" | "tags" | "image" | "link"
  >[];
  latestArticles: Pick<
    ArticleItem,
    "id" | "title" | "platform" | "image" | "date" | "link"
  >[];
};

const HOME_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const HERO_PROFILE_BLOCK_INDEX = 0;
const HERO_DESCRIPTION_BLOCK_INDEX = 1;
const METADATA_FETCH_CONCURRENCY = 8;
const METADATA_FETCH_TIMEOUT_MS = 12_000;
const HOME_CAROUSEL_SLIDE_STYLE: CSSProperties = {
  width: "min(calc(100vw - 2rem), 56rem)",
};
const HOME_CAROUSEL_SLIDE_CLASS = "px-3 pb-8 sm:px-6 md:px-10";
type HeroSlotIndex = 0 | 1;
type HeroSlotState = {
  source: string;
  isVideo: boolean;
  isReady: boolean;
};
type HeroLayerState = {
  visibleSlot: HeroSlotIndex;
  pendingSlot: HeroSlotIndex | null;
  slots: [HeroSlotState, HeroSlotState];
};
type HeroLayerAction =
  | {
      type: "sync-sources";
      hasHeroPreviewSources: boolean;
      currentSource: string;
      nextSource: string;
    }
  | {
      type: "slot-ready";
      slot: HeroSlotIndex;
    }
  | {
      type: "prepare-next";
      source: string;
    };

function createEmptyHeroSlot(): HeroSlotState {
  return { source: "", isVideo: false, isReady: false };
}

function createInitialHeroLayerState(): HeroLayerState {
  return {
    visibleSlot: 0,
    pendingSlot: null,
    slots: [createEmptyHeroSlot(), createEmptyHeroSlot()],
  };
}

function heroLayerReducer(
  state: HeroLayerState,
  action: HeroLayerAction,
): HeroLayerState {
  if (action.type === "sync-sources") {
    if (!action.hasHeroPreviewSources || !action.currentSource) return state;

    const visibleSlotState = state.slots[state.visibleSlot];
    if (!visibleSlotState?.source) {
      const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [
        HeroSlotState,
        HeroSlotState,
      ];
      nextSlots[state.visibleSlot] = {
        source: action.currentSource,
        isVideo: isVideoPreview(action.currentSource),
        isReady: false,
      };
      const hiddenSlot: HeroSlotIndex = state.visibleSlot === 0 ? 1 : 0;
      nextSlots[hiddenSlot] = {
        source: action.nextSource,
        isVideo: isVideoPreview(action.nextSource),
        isReady: false,
      };
      return {
        ...state,
        slots: nextSlots,
      };
    }

    if (visibleSlotState.source === action.currentSource) return state;
    const currentSlot = state.slots.findIndex(
      (slot) => slot.source === action.currentSource,
    ) as HeroSlotIndex | -1;
    if (currentSlot !== 0 && currentSlot !== 1) return state;

    return { ...state, visibleSlot: currentSlot, pendingSlot: null };
  }

  if (action.type === "slot-ready") {
    const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [
      HeroSlotState,
      HeroSlotState,
    ];
    if (!nextSlots[action.slot]?.isReady) {
      nextSlots[action.slot] = { ...nextSlots[action.slot], isReady: true };
    }
    if (state.pendingSlot !== action.slot) {
      return {
        ...state,
        slots: nextSlots,
      };
    }
    return {
      visibleSlot: action.slot,
      pendingSlot: null,
      slots: nextSlots,
    };
  }

  if (action.type === "prepare-next") {
    if (!action.source) return state;
    const hiddenSlot: HeroSlotIndex = state.visibleSlot === 0 ? 1 : 0;
    if (state.slots[hiddenSlot]?.source === action.source) return state;

    const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [
      HeroSlotState,
      HeroSlotState,
    ];
    nextSlots[hiddenSlot] = {
      source: action.source,
      isVideo: isVideoPreview(action.source),
      isReady: false,
    };
    return { ...state, slots: nextSlots };
  }

  return state;
}

export default function HomePage({
  heroPreviewSources,
  heroShuffleSeed,
  heroProfileName,
  heroProfileId,
  heroIntroduction,
  featuredWorks,
  latestArticles,
}: HomePageProps) {
  const [isHomeLoadingVisible, setIsHomeLoadingVisible] = useState(true);
  const [resolvedWorkImageById, setResolvedWorkImageById] = useState<
    Record<string, string>
  >({});
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const { recordReadArticle } = useAchievements();
  const {
    currentHeroSource,
    nextHeroSource,
    isCurrentHeroReady,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onHeroMediaReady,
    onHeroVideoLoadedMetadata,
  } = useHeroSlideshow(heroPreviewSources, heroShuffleSeed);
  const [heroLayerState, dispatchHeroLayer] = useReducer(
    heroLayerReducer,
    undefined,
    createInitialHeroLayerState,
  );
  const {
    visibleSlot: visibleHeroSlot,
    slots: heroSlots,
  } = heroLayerState;
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const displayFeaturedWorks = useMemo(
    () =>
      featuredWorks.map((work) => ({
        ...work,
        image: hasText(work.image)
          ? work.image
          : (resolvedWorkImageById[work.id] ?? ""),
      })),
    [featuredWorks, resolvedWorkImageById],
  );

  useEffect(() => {
    dispatchHeroLayer({
      type: "sync-sources",
      hasHeroPreviewSources,
      currentSource: currentHeroSource,
      nextSource: nextHeroSource,
    });
  }, [currentHeroSource, hasHeroPreviewSources, nextHeroSource]);

  useEffect(() => {
    if (!nextHeroSource) return;

    const timeoutId = window.setTimeout(() => {
      dispatchHeroLayer({ type: "prepare-next", source: nextHeroSource });
    }, HERO_FADE_SECONDS * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [currentHeroSource, nextHeroSource]);

  useEffect(() => {
    const getHeroVideos = () =>
      Array.from(
        heroSectionRef.current?.querySelectorAll<HTMLVideoElement>(
          "video[data-hero-slot]",
        ) ?? [],
      );
    const pauseHiddenVideos = () => {
      getHeroVideos().forEach((video) => {
        if (Number(video.dataset.heroSlot) !== visibleHeroSlot) video.pause();
      });
    };

    const visibleVideo = getHeroVideos().find(
      (video) => Number(video.dataset.heroSlot) === visibleHeroSlot,
    );
    if (document.visibilityState === "visible") {
      void visibleVideo?.play().catch(() => {});
    }

    const pauseTimeoutId = window.setTimeout(
      pauseHiddenVideos,
      HERO_FADE_SECONDS * 1000,
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        getHeroVideos().forEach((video) => video.pause());
        return;
      }

      void getHeroVideos()
        .find((video) => Number(video.dataset.heroSlot) === visibleHeroSlot)
        ?.play()
        .catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearTimeout(pauseTimeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [heroSlots, visibleHeroSlot]);

  const setHeroSlotReady = (slot: HeroSlotIndex) => {
    dispatchHeroLayer({ type: "slot-ready", slot });
  };

  const isVisibleHeroReady =
    isCurrentHeroReady && heroSlots[visibleHeroSlot]?.isReady === true;
  const hasWorkCarouselLoop = displayFeaturedWorks.length > 1;
  const hasArticleCarouselLoop = latestArticles.length > 1;
  const workCarouselSettings = createCenterCarouselSettings({
    infinite: hasWorkCarouselLoop,
    autoplay: hasWorkCarouselLoop,
    autoplaySpeed: 3500,
  });
  const articleCarouselSettings = createCenterCarouselSettings({
    infinite: hasArticleCarouselLoop,
    autoplay: hasArticleCarouselLoop,
    autoplaySpeed: 4000,
  });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const unresolvedImageTargets = featuredWorks
      .filter((work) => !hasText(work.image) && hasText(work.link))
      .map((work) => ({ id: work.id, link: work.link }));

    const enrichFeaturedWorks = async () => {
      await runWithConcurrency(
        unresolvedImageTargets,
        METADATA_FETCH_CONCURRENCY,
        async (target) => {
          const metadata = await fetchLinkMetadata(target.link, {
            includeTitle: false,
            includeImage: true,
            timeoutMs: METADATA_FETCH_TIMEOUT_MS,
            waitForCompleteImageFetch: true,
            signal: controller.signal,
          });
          if (cancelled || !hasText(metadata.image)) return;

          setResolvedWorkImageById((prev) => {
            if (hasText(prev[target.id] ?? "")) return prev;
            return {
              ...prev,
              [target.id]: metadata.image,
            };
          });
        },
      );
    };

    void enrichFeaturedWorks();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [featuredWorks]);

  return (
    <>
      <div className="w-full">
        {/* Hero Slideshow Section */}
        <section
          ref={heroSectionRef}
          className="home-hero relative flex h-dvh w-full items-center justify-center overflow-hidden bg-surface lg:h-[110dvh]"
          data-testid="home-hero"
        >
          <div
            className="absolute inset-0 bg-surface transition-opacity duration-standard"
            style={{ opacity: isVisibleHeroReady ? 0 : 1 }}
          />

          {hasHeroPreviewSources
            ? ([0, 1] as const).map((slot) => {
                const slotState = heroSlots[slot];
                if (!slotState?.source) return null;

                return (
                  <motion.div
                    key={`slot-layer:${slot}`}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: visibleHeroSlot === slot ? 1 : 0 }}
                    transition={{
                      duration: HERO_FADE_SECONDS,
                      ease: MOTION_EASING.enter,
                    }}
                  >
                    {slotState.isVideo ? (
                      <video
                        key={`slot-video:${slot}:${slotState.source}`}
                        src={slotState.source}
                        autoPlay={visibleHeroSlot === slot}
                        loop={!hasMultipleHeroPreviews}
                        muted
                        playsInline
                        preload="auto"
                        onCanPlay={(event) => {
                          onHeroMediaReady(event);
                          setHeroSlotReady(slot);
                        }}
                        onLoadedMetadata={onHeroVideoLoadedMetadata}
                        className="absolute inset-0 w-full h-full object-cover"
                        data-hero-source={slotState.source}
                        data-hero-slot={slot}
                        data-hero-visible={visibleHeroSlot === slot}
                      />
                    ) : (
                      <img
                        key={`slot-image:${slot}:${slotState.source}`}
                        src={slotState.source}
                        alt=""
                        loading="eager"
                        decoding="async"
                        onLoad={(event) => {
                          onHeroMediaReady(event);
                          setHeroSlotReady(slot);
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                );
              })
            : null}

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center lg:right-auto">
            <div className="relative flex h-full w-full items-center lg:w-auto">
              <div
                className="home-hero-overlay pointer-events-none absolute inset-0 bg-surface/50 backdrop-blur-sm"
                data-testid="home-hero-overlay"
              />

              <div className="home-hero-content pointer-events-auto relative w-full px-5 pt-16 sm:px-8 lg:w-auto lg:px-0 lg:pt-0 lg:pl-[8.5rem] lg:pr-28 xl:pr-32">
                <div className="mx-auto w-full max-w-xl lg:mx-0 lg:w-[min(31rem,calc(100vw-38rem))]">
                  <motion.div
                    custom={{
                      index: HERO_PROFILE_BLOCK_INDEX,
                      columns: HOME_SEQUENCE_COLUMNS,
                    }}
                    variants={cardItemMotionVariants}
                    initial="hidden"
                    animate={
                      forceCardVisibleOnRestore ? "visibleInstant" : "visible"
                    }
                    className="home-hero-profile mb-4 flex items-center gap-4 sm:gap-6"
                  >
                    <div className="home-hero-avatar h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-50 shadow-floating sm:h-24 sm:w-24">
                      <img
                        src={PROFILE_ICON_PATH}
                        alt={heroProfileName}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className="home-hero-name text-3xl font-black tracking-tight text-ink sm:text-4xl">
                        {heroProfileName}
                      </h1>
                      <p className={PROFILE_ID_CLASS}>
                        {heroProfileId}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    custom={{
                      index: HERO_DESCRIPTION_BLOCK_INDEX,
                      columns: HOME_SEQUENCE_COLUMNS,
                    }}
                    variants={cardItemMotionVariants}
                    initial="hidden"
                    animate={
                      forceCardVisibleOnRestore ? "visibleInstant" : "visible"
                    }
                  >
                    <p className="home-hero-description mb-5 text-sm font-medium leading-relaxed text-ink-soft sm:text-base">
                      {heroIntroduction}
                    </p>

                    <OutlineActionLink href="/about" label="MORE DETAILS" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Blended bottom transition overlay */}
          <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-page to-transparent z-20 pointer-events-none" />
        </section>

        {/* Featured Works */}
        <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16">
          <div className="relative z-10">
            <div className={PAGE_CONTAINER_CLASS}>
              <SectionTitle title="WORKS" subtitle="注目の作品" />
            </div>

            <div className="relative mt-10 w-full sm:mt-16" data-testid="works-carousel">
              <Slider {...workCarouselSettings}>
                {displayFeaturedWorks.map((work) => (
                  <div
                    key={work.id}
                    style={HOME_CAROUSEL_SLIDE_STYLE}
                    className={HOME_CAROUSEL_SLIDE_CLASS}
                  >
                    <Link
                      href={createWorkDetailHref(work.id)}
                      className={MEDIA_CARD_CLASS}
                    >
                      <MediaPreview
                        src={work.image}
                        alt={work.title}
                        placeholderLabel="No Image"
                        imageClassName="group-hover:scale-105 transition-transform duration-fast"
                      />
                      <ThumbnailOverlay
                        title={work.title}
                        date={work.date}
                        badges={work.tags.map((tag) => ({
                          key: tag,
                          label: tag,
                          backgroundColor: getWorkTagThemeColor(tag),
                        }))}
                      />
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
            {displayFeaturedWorks.length === 0 ? (
              <div className="mt-8 text-center text-muted font-semibold">
                注目作品はまだありません。
              </div>
            ) : null}

            <div className="mt-12 text-center">
              <OutlineActionLink href="/works" label="VIEW ALL" />
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="relative overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-32">
          <div className="relative z-10">
            <div className={PAGE_CONTAINER_CLASS}>
              <SectionTitle title="ARTICLES" subtitle="新着記事" />
            </div>

            <div className="relative mt-10 w-full sm:mt-16" data-testid="articles-carousel">
              <Slider {...articleCarouselSettings}>
                {latestArticles.map((article) => (
                  <div
                    key={article.id}
                    style={HOME_CAROUSEL_SLIDE_STYLE}
                    className={HOME_CAROUSEL_SLIDE_CLASS}
                  >
                    {isExternalLink(article.link) ? (
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) =>
                          recordReadArticle(article.id, {
                            deferNotificationUntilFocus:
                              shouldDeferAchievementNotificationForExternalClick(event),
                          })
                        }
                        className={MEDIA_CARD_CLASS}
                      >
                        <MediaPreview
                          src={article.image}
                          alt={article.title}
                          placeholderLabel={article.platform}
                          imageClassName="group-hover:scale-105 transition-transform duration-fast"
                        />
                        <ThumbnailOverlay
                          title={article.title}
                          date={article.date}
                          metaRowClassName="gap-3"
                          badges={[
                            {
                              key: article.platform,
                              label: article.platform,
                              backgroundColor:
                                ARTICLE_PLATFORM_COLORS[article.platform],
                            },
                          ]}
                        />

                        <div className="absolute right-4 bottom-4 z-10 text-faint transition-colors group-hover:text-brand-500 sm:right-6 sm:bottom-6">
                          <ExternalLink size={20} />
                        </div>
                      </a>
                    ) : (
                      <Link
                        href={article.link}
                        onClick={() => recordReadArticle(article.id)}
                        className={MEDIA_CARD_CLASS}
                      >
                        <MediaPreview
                          src={article.image}
                          alt={article.title}
                          placeholderLabel={article.platform}
                          imageClassName="group-hover:scale-105 transition-transform duration-fast"
                        />
                        <ThumbnailOverlay
                          title={article.title}
                          date={article.date}
                          metaRowClassName="gap-3"
                          badges={[
                            {
                              key: article.platform,
                              label: article.platform,
                              backgroundColor:
                                ARTICLE_PLATFORM_COLORS[article.platform],
                            },
                          ]}
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </Slider>
            </div>
            {latestArticles.length === 0 ? (
              <div className="mt-8 text-center text-muted font-semibold">
                記事はまだありません。
              </div>
            ) : null}

            <div className="mt-12 text-center">
              <OutlineActionLink href="/articles" label="VIEW ALL" />
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isHomeLoadingVisible ? (
          <motion.div
            key="home-loading-screen"
            className="fixed inset-0 z-[10000]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASING.exit }}
          >
            <HomeLoadingScreen
              onLogoAnimationComplete={() => {
                setIsHomeLoadingVisible(false);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
