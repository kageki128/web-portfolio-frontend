/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import Slider from "react-slick";
import { SectionTitle } from "../SectionTitle";
import { ThumbnailOverlay } from "../ThumbnailOverlay";
import { OutlineActionLink } from "../OutlineActionLink";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { ARTICLE_PLATFORM_COLORS, getWorkTagThemeColor } from "@/constants/colors";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import { hasText } from "@/lib/text";
import { isExternalLink } from "@/lib/url";
import { createWorkDetailHref } from "@/lib/workLink";
import type { ArticleItem } from "@/types/articles";
import type { WorkItem } from "@/types/works";
import { HERO_FADE_SECONDS } from "./home/heroUtils";
import { createCenterCarouselSettings } from "./home/sliderSettings";
import { useHeroSlideshow } from "./home/useHeroSlideshow";

type HomePageProps = {
  heroPreviewSources: string[];
  heroProfileName: string;
  heroProfileId: string;
  heroIntroduction: string;
  featuredWorks: Pick<WorkItem, "id" | "title" | "date" | "tags" | "image">[];
  latestArticles: Pick<ArticleItem, "id" | "title" | "platform" | "image" | "date" | "link">[];
};

type WorksMetadataResponse = {
  workImagesById: Record<string, string>;
};

const THUMBNAIL_CARD_CLASS =
  "group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md block cursor-pointer border border-slate-100";
const HOME_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const HERO_PROFILE_BLOCK_INDEX = 0;
const HERO_DESCRIPTION_BLOCK_INDEX = 1;
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

function heroLayerReducer(state: HeroLayerState, action: HeroLayerAction): HeroLayerState {
  if (action.type === "sync-current") {
    if (!action.hasHeroPreviewSources || !action.source) return state;

    const visibleSlotState = state.slots[state.visibleSlot];
    if (!visibleSlotState?.source) {
      const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [HeroSlotState, HeroSlotState];
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
    const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [HeroSlotState, HeroSlotState];
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
    const nextSlots: [HeroSlotState, HeroSlotState] = [...state.slots] as [HeroSlotState, HeroSlotState];
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
  heroProfileName,
  heroProfileId,
  heroIntroduction,
  featuredWorks,
  latestArticles,
}: HomePageProps) {
  const [displayFeaturedWorks, setDisplayFeaturedWorks] = useState(featuredWorks);
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
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
  } = useHeroSlideshow(heroPreviewSources);
  const [heroLayerState, dispatchHeroLayer] = useReducer(
    heroLayerReducer,
    undefined,
    createInitialHeroLayerState,
  );
  const { visibleSlot: visibleHeroSlot, slots: heroSlots } = heroLayerState;

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
    let cancelled = false;

    const enrichFeaturedWorks = async () => {
      try {
        const response = await fetch("/api/works/metadata");
        if (!response.ok) return;

        const metadata = (await response.json()) as WorksMetadataResponse;
        if (cancelled) return;

        setDisplayFeaturedWorks((prev) =>
          prev.map((work) => ({
            ...work,
            image: hasText(work.image) ? work.image : (metadata.workImagesById[work.id] ?? ""),
          })),
        );
      } catch {
        // 補完に失敗しても初期データで表示を継続する
      }
    };

    void enrichFeaturedWorks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full">
      {/* Hero Slideshow Section */}
      <section className="relative w-full h-[110vh] overflow-hidden flex items-center justify-center bg-slate-900">
        <div
          className="absolute inset-0 bg-slate-900 transition-opacity duration-300"
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
                  transition={{ duration: HERO_FADE_SECONDS }}
                >
                  {slotState.isVideo ? (
                    <video
                      key={`slot-video:${slot}:${slotState.source}`}
                      src={slotState.source}
                      autoPlay
                      loop={!hasMultipleHeroPreviews}
                      muted
                      playsInline
                      preload="auto"
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
            preload="auto"
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
              className="absolute inset-0 bg-white/60 backdrop-blur-sm pointer-events-none"
              style={{
                clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
              }}
            />

            <div className="relative pointer-events-auto mt-16 md:mt-0 px-8 md:px-14 lg:pl-[8.5rem] lg:pr-28 xl:pr-32">
              <div className="w-[min(30rem,calc(100vw-5rem))] md:w-[min(32rem,calc(100vw-10rem))] lg:w-[min(31rem,calc(100vw-38rem))]">
                <motion.div
                  custom={{ index: HERO_PROFILE_BLOCK_INDEX, columns: HOME_SEQUENCE_COLUMNS }}
                  variants={cardItemMotionVariants}
                  initial="hidden"
                  animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
                  className="flex items-center gap-6 mb-4"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl bg-cyan-50 shrink-0">
                    <img
                      src={PROFILE_ICON_PATH}
                      alt={heroProfileName}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">{heroProfileName}</h1>
                    <p className="text-cyan-600 font-bold tracking-wider text-sm mt-1">{heroProfileId}</p>
                  </div>
                </motion.div>

                <motion.div
                  custom={{ index: HERO_DESCRIPTION_BLOCK_INDEX, columns: HOME_SEQUENCE_COLUMNS }}
                  variants={cardItemMotionVariants}
                  initial="hidden"
                  animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
                >
                  <p className="text-slate-700 leading-relaxed font-medium mb-5">
                    {heroIntroduction}
                  </p>

                  <OutlineActionLink href="/about" label="MORE DETAILS" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Blended bottom transition overlay */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-linear-to-t from-slate-50 to-transparent z-20 pointer-events-none" />

      </section>

      {/* Featured Works */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <SectionTitle title="WORKS" subtitle="注目の作品" />
          </div>
          
          <div className="mt-16 w-full relative">
            <Slider {...workCarouselSettings}>
              {displayFeaturedWorks.map((work) => (
                <div key={work.id} className="px-3 sm:px-6 md:px-10 pb-8">
                  <Link href={createWorkDetailHref(work.id)} className={THUMBNAIL_CARD_CLASS}>
                    {hasText(work.image) ? (
                      <img
                        src={work.image}
                        alt={work.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : null}
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
            <div className="mt-8 text-center text-slate-500 font-semibold">注目作品はまだありません。</div>
          ) : null}
          
          <div className="mt-12 text-center">
            <OutlineActionLink href="/works" label="VIEW ALL" />
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-6">
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
                      className={THUMBNAIL_CARD_CLASS}
                    >
                      {hasText(article.image) ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : null}
                      <ThumbnailOverlay
                        title={article.title}
                        date={article.date}
                        metaRowClassName="gap-3"
                        badges={[
                          {
                            key: article.platform,
                            label: article.platform,
                            backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform],
                          },
                        ]}
                      />

                      <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors z-10">
                        <ExternalLink size={20} />
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={article.link}
                      className={THUMBNAIL_CARD_CLASS}
                    >
                      {hasText(article.image) ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : null}
                      <ThumbnailOverlay
                        title={article.title}
                        date={article.date}
                        metaRowClassName="gap-3"
                        badges={[
                          {
                            key: article.platform,
                            label: article.platform,
                            backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform],
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
            <div className="mt-8 text-center text-slate-500 font-semibold">記事はまだありません。</div>
          ) : null}
          
          <div className="mt-12 text-center">
            <OutlineActionLink href="/articles" label="VIEW ALL" />
          </div>
        </div>
      </section>

    </div>
  );
}
