"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Boxes, ExternalLink, Gamepad2, Music, Video } from "lucide-react";
import { useAchievementScrollUnlock } from "../achievements/useAchievementScrollUnlock";
import type { InterestCategory } from "@/types/interests";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { MediaPreview } from "../MediaPreview";
import { SectionTitle } from "../SectionTitle";
import { hasText } from "@/lib/text";
import {
  CARD_TITLE_CLASS,
  PAGE_CONTAINER_CLASS,
  PAGE_SHELL_CLASS,
  SURFACE_CARD_CLASS,
} from "@/constants/siteStyles";
import { cn } from "@/lib/cn";

type InterestsPageProps = {
  interests: InterestCategory[];
};

const categoryIcons = {
  LuGamepad2: Gamepad2,
  LuMusic: Music,
  LuVideo: Video,
  LuBookOpen: BookOpen,
  LuBoxes: Boxes,
} as const;

function CategoryIcon({ iconId }: { iconId: string }) {
  const Icon = categoryIcons[iconId as keyof typeof categoryIcons];
  if (!Icon) {
    throw new Error(`Unknown interest icon id: ${iconId}`);
  }
  return <Icon size={32} className="text-brand-500" />;
}

export default function InterestsPage({ interests }: InterestsPageProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  useAchievementScrollUnlock(bottomRef, "interests_bottom");

  return (
    <div className={PAGE_SHELL_CLASS}>
      <div className={PAGE_CONTAINER_CLASS}>
        <SectionTitle title="INTERESTS" subtitle="趣味" />

        <div className="mt-12 flex flex-col space-y-16 sm:mt-20 sm:space-y-24">
          {interests.map((interest) => (
            <section key={interest.category}>
              <motion.div
                custom={{ index: 0, columns: 1 }}
                variants={cardItemMotionVariants}
                initial="hidden"
                animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                whileInView="visible"
                viewport={cardItemViewport}
                className="mb-8 inline-flex items-center gap-3 border-b-4 border-brand-500 pb-2 sm:mb-10 sm:gap-4"
              >
                <CategoryIcon iconId={interest.iconId} />
                <h2 className="text-2xl font-black text-ink sm:text-3xl md:text-4xl">
                  {interest.category}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {interest.items.map((item, index) => {
                  const hasLink = hasText(item.link);

                  const cardContent = (
                    <>
                      <div className="aspect-video w-full overflow-hidden relative">
                        <MediaPreview
                          src={item.image}
                          alt={item.name}
                          metadataLink={item.link}
                          placeholderLabel="No Image"
                        />
                      </div>
                      <div className="relative p-4 sm:p-6">
                        {hasLink && (
                          <div className="absolute top-4 right-4 text-faint transition-colors group-hover:text-brand-500 sm:top-6 sm:right-6">
                            <ExternalLink size={18} />
                          </div>
                        )}
                        <h3
                          className={cn(
                            CARD_TITLE_CLASS,
                            "text-left line-clamp-2 min-h-[3em]",
                            hasLink && "pr-8",
                          )}
                        >
                          {item.name}
                        </h3>
                      </div>
                    </>
                  );

                  const className = SURFACE_CARD_CLASS;

                  if (hasLink) {
                    return (
                      <motion.a
                        custom={{ index, columns: cardColumns }}
                        variants={cardItemMotionVariants}
                        initial="hidden"
                        animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                        whileInView="visible"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        viewport={cardItemViewport}
                        whileHover="hover"
                        key={item.id}
                        className={className}
                      >
                        {cardContent}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.div
                      custom={{ index, columns: cardColumns }}
                      variants={cardItemMotionVariants}
                      initial="hidden"
                      animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                      whileInView="visible"
                      viewport={cardItemViewport}
                      whileHover="hover"
                      key={item.id}
                      className={className}
                    >
                      {cardContent}
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div ref={bottomRef} aria-hidden className="h-1 w-full" />
      </div>
    </div>
  );
}
