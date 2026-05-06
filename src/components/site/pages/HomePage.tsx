/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowDown, ExternalLink } from "lucide-react";
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
import type { ArticleItem } from "@/types/articles";
import type { WorkItem } from "@/types/works";

const HERO_MAX_DISPLAY_MILLISECONDS = 6000;
const HERO_FADE_SECONDS = 0.6;
const HERO_FADE_MILLISECONDS = HERO_FADE_SECONDS * 1000;
const HERO_SWITCH_BUFFER_MILLISECONDS = 100;
const HERO_MIN_DISPLAY_MILLISECONDS = 150;
const HERO_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v", "m3u8"]);

type ArrowProps = {
  onClick?: () => void;
};

const NextArrow = (props: ArrowProps) => {
  const { onClick } = props;
  return (
    <div className="absolute right-[12%] sm:right-[18%] lg:right-[23%] xl:right-[28%] top-0 bottom-8 z-20 flex items-center justify-center translate-x-1/2 pointer-events-none">
      <button 
        onClick={onClick} 
        className="text-slate-300 hover:text-cyan-500 transition-all pointer-events-auto hover:scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        <ChevronRight size={64} strokeWidth={1.5} />
      </button>
    </div>
  );
};

const PrevArrow = (props: ArrowProps) => {
  const { onClick } = props;
  return (
    <div className="absolute left-[12%] sm:left-[18%] lg:left-[23%] xl:left-[28%] top-0 bottom-8 z-20 flex items-center justify-center -translate-x-1/2 pointer-events-none">
      <button 
        onClick={onClick} 
        className="text-slate-300 hover:text-cyan-500 transition-all pointer-events-auto hover:scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        <ChevronLeft size={64} strokeWidth={1.5} />
      </button>
    </div>
  );
};

type HomePageProps = {
  heroPreviewSources: string[];
  heroProfileName: string;
  heroProfileId: string;
  heroIntroduction: string;
  featuredWorks: WorkItem[];
  latestArticles: ArticleItem[];
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function getFileExtension(path: string): string | null {
  const normalizedPath = path.trim().split("#")[0]?.split("?")[0] ?? path.trim();
  const extension = normalizedPath.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  return extension?.toLowerCase() ?? null;
}

function isVideoPreview(previewSource: string): boolean {
  const extension = getFileExtension(previewSource);
  return extension !== null && HERO_VIDEO_EXTENSIONS.has(extension);
}

function resolveVideoDisplayMilliseconds(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return HERO_MAX_DISPLAY_MILLISECONDS;
  }

  return Math.max(
    HERO_MIN_DISPLAY_MILLISECONDS,
    Math.min(
      HERO_MAX_DISPLAY_MILLISECONDS,
      durationSeconds * 1000 - HERO_FADE_MILLISECONDS - HERO_SWITCH_BUFFER_MILLISECONDS,
    ),
  );
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const shuffledItems = [...items];
  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];
    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }
  return shuffledItems;
}

const THUMBNAIL_CARD_CLASS =
  "group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md block cursor-pointer border border-slate-100";
const HOME_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const HERO_PROFILE_BLOCK_INDEX = 0;
const HERO_DESCRIPTION_BLOCK_INDEX = 1;

export default function HomePage({
  heroPreviewSources,
  heroProfileName,
  heroProfileId,
  heroIntroduction,
  featuredWorks,
  latestArticles,
}: HomePageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoDurationBySource, setVideoDurationBySource] = useState<Record<string, number>>({});
  const currentSlideStartedAtRef = useRef(0);
  const currentHeroSourceRef = useRef("");
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const homeFeaturedWorks = featuredWorks;
  const homeArticles = latestArticles;
  const heroPreviewSourcesInLoopOrder = useMemo(() => {
    if (heroPreviewSources.length < 2) {
      return heroPreviewSources;
    }
    return shuffleArray(heroPreviewSources);
  }, [heroPreviewSources]);
  const hasHeroPreviewSources = heroPreviewSourcesInLoopOrder.length > 0;
  const hasMultipleHeroPreviews = heroPreviewSourcesInLoopOrder.length > 1;
  const normalizedCurrentSlide = hasHeroPreviewSources ? currentSlide % heroPreviewSourcesInLoopOrder.length : 0;
  const currentHeroSource = hasHeroPreviewSources ? heroPreviewSourcesInLoopOrder[normalizedCurrentSlide] : "";
  const currentHeroIsVideo = hasHeroPreviewSources && isVideoPreview(currentHeroSource);
  const currentVideoDurationSeconds = currentHeroSource ? (videoDurationBySource[currentHeroSource] ?? null) : null;
  const hasWorkCarouselLoop = homeFeaturedWorks.length > 1;
  const hasArticleCarouselLoop = homeArticles.length > 1;

  useEffect(() => {
    currentHeroSourceRef.current = currentHeroSource;
  }, [currentHeroSource]);

  // Loading Screen Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Track each slide's start time.
  useEffect(() => {
    if (loading || !hasMultipleHeroPreviews) return;
    currentSlideStartedAtRef.current = Date.now();
  }, [loading, hasMultipleHeroPreviews, normalizedCurrentSlide]);

  // Schedule slide change.
  useEffect(() => {
    if (loading || !hasMultipleHeroPreviews) return;

    const slideStartAt = currentSlideStartedAtRef.current;
    const elapsedMilliseconds = slideStartAt > 0 ? Date.now() - slideStartAt : 0;
    const targetDisplayMilliseconds = currentHeroIsVideo && currentVideoDurationSeconds !== null
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
    loading,
    hasMultipleHeroPreviews,
    currentHeroIsVideo,
    currentVideoDurationSeconds,
    heroPreviewSourcesInLoopOrder.length,
    normalizedCurrentSlide,
  ]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-8"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-cyan-500 tracking-[0.5em] font-bold text-sm"
        >
          NOW LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Slideshow Section */}
      <section className="relative w-full h-[110vh] overflow-hidden flex items-center justify-center bg-slate-900">
        <AnimatePresence mode="sync">
          {hasHeroPreviewSources ? (
            currentHeroIsVideo ? (
              <motion.video
                key={`${normalizedCurrentSlide}:${currentHeroSource}`}
                src={currentHeroSource}
                autoPlay
                loop={!hasMultipleHeroPreviews}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(event) => {
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
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: HERO_FADE_SECONDS }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.img
                key={`${normalizedCurrentSlide}:${currentHeroSource}`}
                src={currentHeroSource}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: HERO_FADE_SECONDS }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : null}
        </AnimatePresence>
        
        {/* Left diagonal overlay */}
        <div 
          className="absolute top-0 left-0 w-full md:w-[54%] lg:w-[44%] h-full bg-white/60 backdrop-blur-sm z-10 pointer-events-none"
          style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0% 100%)" }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 pointer-events-none">
          <div className="max-w-lg pointer-events-auto mt-16 md:mt-0 lg:ml-8 xl:ml-12">
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

        {/* Blended bottom transition overlay */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-slate-50 to-transparent z-20 pointer-events-none" />

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-800 z-30"
        >
          <span className="text-[10px] font-black tracking-[0.2em] mb-1">SCROLL</span>
          <ArrowDown size={20} className="text-cyan-500" />
        </motion.div>
      </section>

      {/* Featured Works */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <SectionTitle title="WORKS" subtitle="注目の作品" />
          </div>
          
          <div className="mt-16 w-full relative">
            <Slider 
              dots={false} 
              infinite={hasWorkCarouselLoop}
              centerMode={true}
              centerPadding="28%"
              speed={600} 
              slidesToShow={1} 
              slidesToScroll={1} 
              autoplay={hasWorkCarouselLoop}
              autoplaySpeed={3500} 
              nextArrow={<NextArrow />} 
              prevArrow={<PrevArrow />}
              responsive={[
                { breakpoint: 1280, settings: { slidesToShow: 1, centerPadding: '23%' } },
                { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '18%' } },
                { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '12%' } }
              ]}
            >
              {homeFeaturedWorks.map((work) => (
                <div key={work.id} className="px-3 sm:px-6 md:px-10 pb-8">
                  <Link href={`/works#work=${work.id}`} className={THUMBNAIL_CARD_CLASS}>
                    {hasText(work.image) ? (
                      <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : null}
                    <ThumbnailOverlay
                      title={work.title}
                      date={work.date}
                      badges={work.tags.map((tag) => ({
                        key: tag,
                        label: tag,
                        className: "bg-cyan-500",
                        style: { backgroundColor: getWorkTagThemeColor(tag) ?? undefined },
                      }))}
                    />
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
          {homeFeaturedWorks.length === 0 ? (
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
            <Slider 
              dots={false} 
              infinite={hasArticleCarouselLoop}
              centerMode={true}
              centerPadding="28%"
              speed={600} 
              slidesToShow={1} 
              slidesToScroll={1} 
              autoplay={hasArticleCarouselLoop}
              autoplaySpeed={4000} 
              nextArrow={<NextArrow />} 
              prevArrow={<PrevArrow />}
              responsive={[
                { breakpoint: 1280, settings: { slidesToShow: 1, centerPadding: '23%' } },
                { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '18%' } },
                { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '12%' } }
              ]}
            >
              {homeArticles.map((article) => (
                <div key={article.id} className="px-3 sm:px-6 md:px-10 pb-8">
                  {isExternalLink(article.link) ? (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={THUMBNAIL_CARD_CLASS}
                    >
                      {hasText(article.image) ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : null}
                      <ThumbnailOverlay
                        title={article.title}
                        date={article.date}
                        metaRowClassName="gap-3"
                        badges={[
                          {
                            key: article.platform,
                            label: article.platform,
                            style: { backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] },
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
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : null}
                      <ThumbnailOverlay
                        title={article.title}
                        date={article.date}
                        metaRowClassName="gap-3"
                        badges={[
                          {
                            key: article.platform,
                            label: article.platform,
                            style: { backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] },
                          },
                        ]}
                      />
                    </Link>
                  )}
                </div>
              ))}
            </Slider>
          </div>
          {homeArticles.length === 0 ? (
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
