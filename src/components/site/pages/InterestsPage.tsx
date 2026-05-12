"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Boxes, ExternalLink, Gamepad2, Music, Video } from "lucide-react";
import type { InterestCategory, InterestItem } from "@/types/interests";
import {
  cardItemMotionVariants,
  cardItemViewport,
  useCardGridColumns,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { MediaPreview } from "../MediaPreview";
import { SectionTitle } from "../SectionTitle";
import { fetchLinkMetadata } from "@/lib/linkMetadataClient";
import { hasText } from "@/lib/text";
import { runWithConcurrency } from "@/lib/runWithConcurrency";
import { SURFACE_CARD_CLASS } from "@/constants/siteStyles";

type InterestsPageProps = {
  interests: InterestCategory[];
};

const METADATA_FETCH_CONCURRENCY = 8;
const METADATA_FETCH_TIMEOUT_MS = 12_000;

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
  return <Icon size={32} className="text-cyan-500" />;
}

function applyResolvedImageToInterest(
  item: InterestItem,
  resolvedImageByLink: Record<string, string>,
): InterestItem {
  if (hasText(item.image)) {
    return item;
  }

  const resolvedImage = resolvedImageByLink[item.link] ?? "";
  if (!hasText(resolvedImage)) {
    return item;
  }

  return {
    ...item,
    image: resolvedImage,
  };
}

export default function InterestsPage({ interests }: InterestsPageProps) {
  const [resolvedImageByLink, setResolvedImageByLink] = useState<Record<string, string>>({});
  const cardColumns = useCardGridColumns();
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();

  const displayInterests = useMemo(
    () =>
      interests.map((interest) => ({
        ...interest,
        items: interest.items.map((item) => applyResolvedImageToInterest(item, resolvedImageByLink)),
      })),
    [interests, resolvedImageByLink],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const unresolvedLinks = Array.from(
      new Set(
        interests
          .flatMap((interest) => interest.items)
          .filter((item) => !hasText(item.image) && hasText(item.link))
          .map((item) => item.link),
      ),
    );

    const enrichInterests = async () => {
      await runWithConcurrency(unresolvedLinks, METADATA_FETCH_CONCURRENCY, async (link) => {
        const metadata = await fetchLinkMetadata(link, {
          includeTitle: false,
          includeImage: true,
          timeoutMs: METADATA_FETCH_TIMEOUT_MS,
          waitForCompleteImageFetch: true,
          signal: controller.signal,
        });
        if (cancelled || !hasText(metadata.image)) return;

        setResolvedImageByLink((prev) => {
          if (hasText(prev[link] ?? "")) return prev;
          return {
            ...prev,
            [link]: metadata.image,
          };
        });
      });
    };

    void enrichInterests();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [interests]);

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="INTERESTS" subtitle="趣味" />

        <div className="mt-20 flex flex-col space-y-24">
          {displayInterests.map((interest) => (
            <section key={interest.category}>
              <motion.div
                custom={{ index: 0, columns: 1 }}
                variants={cardItemMotionVariants}
                initial="hidden"
                animate={forceCardVisibleOnRestore ? "visibleInstant" : undefined}
                whileInView="visible"
                viewport={cardItemViewport}
                className="inline-flex items-center gap-4 mb-10 border-b-4 border-cyan-500 pb-2"
              >
                <CategoryIcon iconId={interest.iconId} />
                <h2 className="text-3xl md:text-4xl font-black text-slate-800">
                  {interest.category}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {interest.items.map((item, index) => {
                  const hasLink = hasText(item.link);

                  const cardContent = (
                    <>
                      <div className="aspect-video w-full overflow-hidden relative">
                        <MediaPreview src={item.image} alt={item.name} placeholderLabel="No Visual" />
                      </div>
                      <div className="p-6 relative">
                        {hasLink && (
                          <div className="absolute top-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors">
                            <ExternalLink size={18} />
                          </div>
                        )}
                        <h3
                          className={`text-lg font-bold text-slate-800 text-left leading-normal group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em] ${
                            hasLink ? "pr-8" : ""
                          }`}
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
      </div>
    </div>
  );
}
