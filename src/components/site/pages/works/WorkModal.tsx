/* eslint-disable @next/next/no-img-element */

import { motion, type Variants } from "framer-motion";
import { BadgeCheck, BookOpen, Calendar, ExternalLink, Users, Wrench, X } from "lucide-react";
import { SiteBadge } from "@/components/site/SiteBadge";
import { getWorkTagThemeColor } from "@/constants/colors";
import { MOTION_DURATION, MOTION_EASING } from "@/constants/motion";
import {
  ACTION_BASE_CLASS,
  EYEBROW_CLASS,
  ICON_ACTION_CLASS,
  PANEL_CLASS,
  PRIMARY_ACTION_CLASS,
} from "@/constants/siteStyles";
import { cn } from "@/lib/cn";
import { hasText } from "@/lib/text";
import type { WorkItem } from "@/types/works";

const WORK_IMAGE_ASPECT_CLASS = "aspect-[16/9]";
const MODAL_BACKDROP_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASING.exit },
  },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_DURATION.standard, ease: MOTION_EASING.enter },
  },
};
const MODAL_PANEL_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASING.exit },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.standard, ease: MOTION_EASING.enter },
  },
};

type WorkModalProps = {
  work: WorkItem;
  onClose: () => void;
};

export function WorkModal({ work, onClose }: WorkModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 md:p-12">
      <motion.div
        variants={MODAL_BACKDROP_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="absolute inset-0 bg-media/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <motion.div
        variants={MODAL_PANEL_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-y-auto overscroll-contain rounded-card bg-surface shadow-modal sm:max-h-[90dvh]"
      >
        <button
          onClick={onClose}
          className={cn(
            ICON_ACTION_CLASS,
            "absolute top-4 right-4 z-10 h-10 w-10 bg-black/50 text-white backdrop-blur-md hover:bg-black/80",
          )}
          aria-label="詳細モーダルを閉じる"
        >
          <X size={20} />
        </button>

        <div className={`w-full ${WORK_IMAGE_ASPECT_CLASS} bg-media relative shrink-0 overflow-hidden`}>
          {hasText(work.preview) ? (
            <video
              src={work.preview}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={hasText(work.image) ? work.image : undefined}
              className="w-full h-full object-cover"
            />
          ) : hasText(work.image) ? (
            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-media/80 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="text-pale font-bold text-xs">{work.date}</div>
              {work.tags.map((tag) => (
                <SiteBadge
                  key={tag}
                  label={tag}
                  backgroundColor={getWorkTagThemeColor(tag)}
                  variant="tag"
                />
              ))}
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-2xl font-black leading-tight tracking-tight text-white break-words sm:text-4xl md:text-5xl">
                {work.title}
              </h2>
              {hasText(work.link) ? (
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(PRIMARY_ACTION_CLASS, "min-h-11 shrink-0 self-end px-5 py-2.5 sm:px-6 sm:py-3")}
                >
                  VIEW <ExternalLink size={18} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={cn(
                    ACTION_BASE_CLASS,
                    "min-h-11 shrink-0 self-end cursor-not-allowed rounded-full bg-muted px-5 py-2.5 text-white opacity-80 sm:px-6 sm:py-3",
                  )}
                >
                  NO LINK
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-page p-4 sm:p-6 md:p-8">
          <div className={cn(PANEL_CLASS, "mb-6 p-4 sm:mb-8 sm:p-6")}>
            <h3 className={cn(EYEBROW_CLASS, "mb-3 text-sm")}>OVERVIEW</h3>
            <p className="font-medium leading-relaxed text-ink-soft sm:text-lg">{work.desc}</p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2">
            <div className={cn(PANEL_CLASS, "flex items-start gap-4 p-4 sm:p-5")}>
              <Users className="text-brand-500 mt-1 shrink-0" size={24} />
              <div>
                <div className={cn(EYEBROW_CLASS, "mb-1")}>MEMBERS</div>
                <div className="font-medium text-ink">{work.members}</div>
              </div>
            </div>

            <div className={cn(PANEL_CLASS, "flex items-start gap-4 p-4 sm:p-5")}>
              <BadgeCheck className="text-brand-500 mt-1 shrink-0" size={24} />
              <div>
                <div className={cn(EYEBROW_CLASS, "mb-1")}>ROLE</div>
                <div className="font-medium text-ink">{work.role}</div>
              </div>
            </div>

            <div className={cn(PANEL_CLASS, "flex items-start gap-4 p-4 sm:p-5")}>
              <Wrench className="text-brand-500 mt-1 shrink-0" size={24} />
              <div>
                <div className={cn(EYEBROW_CLASS, "mb-1")}>TECH STACK</div>
                <div className="font-medium text-ink">{work.tech}</div>
              </div>
            </div>

            <div className={cn(PANEL_CLASS, "flex items-start gap-4 p-4 sm:p-5")}>
              <Calendar className="text-brand-500 mt-1 shrink-0" size={24} />
              <div>
                <div className={cn(EYEBROW_CLASS, "mb-1")}>DURATION</div>
                <div className="font-medium text-ink">{work.duration}</div>
              </div>
            </div>
          </div>

          <div className={cn(PANEL_CLASS, "mb-8 p-4 sm:p-6")}>
            <h3 className={cn(EYEBROW_CLASS, "mb-4 flex items-center gap-2 text-sm")}>
              <BookOpen size={16} className="text-brand-500" />
              <span>RELATED ARTICLES</span>
            </h3>
            {work.articles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {work.articles.map((article) => (
                  <a
                    key={article.link}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-control border border-transparent p-3 font-medium text-ink-soft transition-colors hover:border-line-soft hover:bg-page hover:text-brand-600"
                  >
                    <ExternalLink
                      size={18}
                      className="text-subtle group-hover:text-brand-500 transition-colors shrink-0"
                    />
                    <span className="line-clamp-1">{hasText(article.title) ? article.title : article.link}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted font-medium">関連記事はありません。</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
