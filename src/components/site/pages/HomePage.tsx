/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
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
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const {
    currentHeroSource,
    currentHeroIsVideo,
    normalizedCurrentSlide,
    hasHeroPreviewSources,
    hasMultipleHeroPreviews,
    onVideoLoadedMetadata,
  } = useHeroSlideshow(heroPreviewSources);
  const hasWorkCarouselLoop = featuredWorks.length > 1;
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
                onLoadedMetadata={onVideoLoadedMetadata}
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
                loading="eager"
                decoding="async"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: HERO_FADE_SECONDS }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : null}
        </AnimatePresence>
        
        <div className="absolute inset-y-0 left-0 z-20 flex items-center pointer-events-none">
          <div className="relative h-full flex items-center">
            <div
              className="absolute inset-0 bg-white/60 backdrop-blur-sm pointer-events-none"
              style={{
                clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
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
              {featuredWorks.map((work) => (
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
          {featuredWorks.length === 0 ? (
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
