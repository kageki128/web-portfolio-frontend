/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useReducer, useState } from "react";
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
  PROFILE_AVATAR_CLASS,
  PROFILE_ID_CLASS,
  PROFILE_NAME_CLASS,
} from "@/constants/siteStyles";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import { isExternalLink } from "@/lib/url";
import { createWorkDetailHref } from "@/lib/workLink";
import type { ArticleItem } from "@/types/articles";
import type { WorkItem } from "@/types/works";
import { HERO_FADE_SECONDS } from "./home/heroUtils";
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
      type: "sync-current";
      hasHeroPreviewSources: boolean;
      source: string;
      isVideo: boolean;
    }
  | {
      type: "slot-ready";
      slot: HeroSlotIndex;
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
  if (action.type === "sync-current") {
    if (!action.hasHeroPreviewSources || !action.source) return state;

    const visibleSlotState = state.slots[state.visibleSlot];
    if (!visibleSlotState?.source) {
      const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [
        HeroSlotState,
        HeroSlotState,
      ];
      nextSlots[state.visibleSlot] = {
        source: action.source,
        isVideo: action.isVideo,
        isReady: !action.isVideo,
      };
      return {
        ...state,
        slots: nextSlots,
      };
    }

    if (visibleSlotState.source === action.source) return state;

    const hiddenSlot: HeroSlotIndex = state.visibleSlot === 0 ? 1 : 0;
    const hiddenSlotState = state.slots[hiddenSlot];
    const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [
      HeroSlotState,
      HeroSlotState,
    ];
    if (hiddenSlotState?.source !== action.source) {
      nextSlots[hiddenSlot] = {
        source: action.source,
        isVideo: action.isVideo,
        isReady: !action.isVideo,
      };
    }

    return {
      ...state,
      pendingSlot: hiddenSlot,
      slots: nextSlots,
    };
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
    currentHeroIsVideo,
    nextHeroVideoToPreload,
    normalizedCurrentSlide,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onCurrentVideoCanPlay,
    onCurrentVideoLoadedMetadata,
    onPreloadVideoCanPlay,
    onPreloadVideoLoadedMetadata,
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
      type: "sync-current",
      hasHeroPreviewSources,
      source: currentHeroSource,
      isVideo: currentHeroIsVideo,
    });
  }, [currentHeroIsVideo, currentHeroSource, hasHeroPreviewSources]);

  const setHeroSlotReady = (slot: HeroSlotIndex) => {
    dispatchHeroLayer({ type: "slot-ready", slot });
  };

  const isVisibleHeroReady = heroSlots[visibleHeroSlot]?.isReady === true;
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
        <section className="relative w-full h-[110vh] overflow-hidden flex items-center justify-center bg-surface">
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
                        autoPlay
                        loop={!hasMultipleHeroPreviews}
                        muted
                        playsInline
                        preload="metadata"
                        onCanPlay={(event) => {
                          onCurrentVideoCanPlay(event);
                          setHeroSlotReady(slot);
                        }}
                        onLoadedMetadata={onCurrentVideoLoadedMetadata}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        key={`slot-image:${slot}:${slotState.source}`}
                        src={slotState.source}
                        alt=""
                        loading="eager"
                        decoding="async"
                        onLoad={() => {
                          setHeroSlotReady(slot);
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                );
              })
            : null}

          {nextHeroVideoToPreload ? (
            <video
              key={`preload:${normalizedCurrentSlide}:${nextHeroVideoToPreload}`}
              src={nextHeroVideoToPreload}
              preload="metadata"
              muted
              playsInline
              onCanPlay={onPreloadVideoCanPlay}
              onLoadedMetadata={onPreloadVideoLoadedMetadata}
              className="hidden"
              aria-hidden="true"
            />
          ) : null}

          <div className="absolute inset-y-0 left-0 z-20 flex items-center pointer-events-none">
            <div className="relative h-full flex items-center">
              <div
                className="absolute inset-0 bg-surface/60 backdrop-blur-sm pointer-events-none"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
                }}
              />

              <div className="relative pointer-events-auto mt-16 md:mt-0 px-8 md:px-14 lg:pl-[8.5rem] lg:pr-28 xl:pr-32">
                <div className="w-[min(30rem,calc(100vw-5rem))] md:w-[min(32rem,calc(100vw-10rem))] lg:w-[min(31rem,calc(100vw-38rem))]">
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
                    className="flex items-center gap-6 mb-4"
                  >
                    <div className={PROFILE_AVATAR_CLASS}>
                      <img
                        src={PROFILE_ICON_PATH}
                        alt={heroProfileName}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className={PROFILE_NAME_CLASS}>
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
                    <p className="text-ink-soft leading-relaxed font-medium mb-5">
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
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="relative z-10">
            <div className={PAGE_CONTAINER_CLASS}>
              <SectionTitle title="WORKS" subtitle="注目の作品" />
            </div>

            <div className="mt-16 w-full relative">
              <Slider {...workCarouselSettings}>
                {displayFeaturedWorks.map((work) => (
                  <div key={work.id} className="px-3 sm:px-6 md:px-10 pb-8">
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
        <section className="relative pt-16 pb-32 overflow-hidden">
          <div className="relative z-10">
            <div className={PAGE_CONTAINER_CLASS}>
              <SectionTitle title="ARTICLES" subtitle="新着記事" />
            </div>

            <div className="mt-16 w-full relative">
              <Slider {...articleCarouselSettings}>
                {latestArticles.map((article) => (
                  <div key={article.id} className="px-3 sm:px-6 md:px-10 pb-8">
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

                        <div className="absolute bottom-6 right-6 text-faint group-hover:text-brand-500 transition-colors z-10">
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
