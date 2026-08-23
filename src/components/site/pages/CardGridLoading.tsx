import { SectionTitle } from "@/components/site/SectionTitle";
import {
  PAGE_CONTAINER_CLASS,
  PAGE_SECTION_HEADING_CLASS,
  PAGE_SHELL_CLASS,
} from "@/constants/siteStyles";

type CardGridLoadingProps = {
  title: string;
  subtitle: string;
  sectionTitle?: string;
  showFilters?: boolean;
};

const SKELETON_CARD_COUNT = 6;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-line-soft bg-surface shadow-card">
      <div className="aspect-video animate-pulse bg-pale motion-reduce:animate-none" />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-pale motion-reduce:animate-none" />
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-pale motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function CardGridLoading({
  title,
  subtitle,
  sectionTitle,
  showFilters = false,
}: CardGridLoadingProps) {
  return (
    <div
      className={PAGE_SHELL_CLASS}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{subtitle}ページを読み込んでいます</span>

      <div className={PAGE_CONTAINER_CLASS} aria-hidden="true">
        <SectionTitle title={title} subtitle={subtitle} />

        <section className="mt-12 mb-24 sm:mt-20 sm:mb-32">
          {sectionTitle ? (
            <div className={`${PAGE_SECTION_HEADING_CLASS} mb-8 sm:mb-12`}>
              {sectionTitle}
            </div>
          ) : null}

          {showFilters ? (
            <div className="mb-12 flex flex-wrap justify-center gap-3 sm:mb-16">
              {[5, 4, 5, 4, 5].map((width, index) => (
                <div
                  key={index}
                  className="h-11 animate-pulse rounded-full bg-pale motion-reduce:animate-none"
                  style={{ width: `${width}rem` }}
                />
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
