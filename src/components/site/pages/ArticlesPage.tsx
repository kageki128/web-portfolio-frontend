"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Rss } from "lucide-react";
import { MediaPreview } from "../MediaPreview";
import {
  shouldDeferAchievementNotificationForExternalClick,
  useAchievements,
} from "../achievements/AchievementProvider";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { SiteBadge } from "../SiteBadge";
import { SectionTitle } from "../SectionTitle";
import { ARTICLE_PLATFORM_COLORS, ARTICLE_PLATFORM_FILTERS } from "@/constants/colors";
import { SURFACE_CARD_CLASS } from "@/constants/siteStyles";
import { isExternalLink } from "@/lib/url";
import type { ArticleItem, ArticlePlatformFilter } from "@/types/articles";

type ArticleCardProps = {
  article: ArticleItem;
  index: number;
  columns: number;
  forceVisible: boolean;
};

function ArticleCard({ article, index, columns, forceVisible }: ArticleCardProps) {
  const hasExternalLink = isExternalLink(article.link);
  const { recordReadArticle } = useAchievements();

  const content = (
    <>
      <div className="aspect-video w-full overflow-hidden relative bg-surface">
        <MediaPreview src={article.image} alt={article.title} placeholderLabel={article.platform} />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-subtle font-bold text-xs">{article.date}</div>
          <SiteBadge
            label={article.platform}
            backgroundColor={ARTICLE_PLATFORM_COLORS[article.platform]}
            variant="meta"
          />
          {hasExternalLink && (
            <div className="ml-auto text-faint group-hover:text-brand-500 transition-colors">
              <ExternalLink size={18} />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-ink leading-normal group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[3em]">
          {article.title}
        </h3>
      </div>
    </>
  );

  if (!hasExternalLink) {
    return (
      <motion.article
        custom={{ index, columns }}
        variants={cardItemMotionVariants}
        initial="hidden"
        animate={forceVisible ? "visibleInstant" : undefined}
        whileInView="visible"
        viewport={cardItemViewport}
        exit="exit"
        whileHover="hover"
        className={SURFACE_CARD_CLASS}
      >
        <Link
          href={article.link}
          className="block"
          onClick={() => recordReadArticle(article.id)}
        >
          {content}
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.a
      custom={{ index, columns }}
      variants={cardItemMotionVariants}
      initial="hidden"
      animate={forceVisible ? "visibleInstant" : undefined}
      whileInView="visible"
      viewport={cardItemViewport}
      exit="exit"
      whileHover="hover"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) =>
        recordReadArticle(article.id, {
          deferNotificationUntilFocus:
            shouldDeferAchievementNotificationForExternalClick(event),
        })
      }
      className={SURFACE_CARD_CLASS}
    >
      {content}
    </motion.a>
  );
}

type ArticlesPageProps = {
  articles: ArticleItem[];
};

type FilterButtonStyle = CSSProperties & {
  "--filter-color": string;
};

export default function ArticlesPage({ articles }: ArticlesPageProps) {
  const [filter, setFilter] = useState<ArticlePlatformFilter>("All");
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const filteredArticles = useMemo(
    () => (filter === "All" ? articles : articles.filter((article) => article.platform === filter)),
    [articles, filter],
  );

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ARTICLES" subtitle="記事" />
        
        <section className="mt-20 mb-32">
          {/* Filters */}
          <div className="mb-8 grid gap-3 md:grid-cols-[2.5rem_1fr_2.5rem] md:items-center">
            <div aria-hidden className="hidden h-10 w-10 md:block" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              {ARTICLE_PLATFORM_FILTERS.map((platform) => {
                const isActive = filter === platform;
                const color = ARTICLE_PLATFORM_COLORS[platform];
                const buttonStyle: FilterButtonStyle = isActive
                  ? {
                      "--filter-color": color,
                      backgroundColor: "var(--filter-color)",
                      borderColor: "var(--filter-color)",
                    }
                  : {
                      "--filter-color": color,
                      borderColor: `${color}66`,
                    };

                return (
                  <button
                    key={platform}
                    onClick={() => setFilter(platform)}
                    style={buttonStyle}
                    className={`cursor-pointer px-6 py-2.5 rounded-full border bg-surface font-bold text-sm transition-colors duration-200 hover:bg-(--filter-color) hover:border-(--filter-color) hover:text-white hover:shadow-lg ${
                      isActive ? "text-white shadow-lg" : "text-(--filter-color)"
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS購読"
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-body/40 text-body transition-all hover:border-brand-500 hover:text-brand-500 hover:shadow-lg hover:shadow-brand-500/10 md:justify-self-end"
            >
              <Rss size={18} />
              <span className="sr-only">RSS購読</span>
            </a>
          </div>

          {/* Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence key={filter}>
              {filteredArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  columns={cardColumns}
                  forceVisible={forceCardVisibleOnRestore}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredArticles.length === 0 && (
            <div className="mt-12 text-center text-muted font-semibold">記事はまだありません。</div>
          )}
        </section>
      </div>
    </div>
  );
}
