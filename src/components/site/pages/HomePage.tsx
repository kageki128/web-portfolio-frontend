/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, ArrowDown, ExternalLink } from "lucide-react";
import Slider from "react-slick";
import { SectionTitle } from "../SectionTitle";
import {
  cardItemMotionVariants,
  useForceCardVisibleOnRestore,
} from "../motion/cardItemMotion";
import { ARTICLE_PLATFORM_COLORS } from "@/constants/colors";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import type { ArticleItem } from "@/types/articles";
import type { WorkItem } from "@/types/works";

// Mock Images
const slides = [
  "https://images.unsplash.com/photo-1719516937211-7d70087dd03d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHN0eWxlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NzgwOTQyNHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1760539620142-70bcd136b5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0YWdlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3NzgwOTQyNHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1713188090500-a4fb0d2cf309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzc3ODA5NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

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
  featuredWorks: WorkItem[];
  latestArticles: ArticleItem[];
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isExternalLink(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

const THUMBNAIL_OVERLAY_DATE_CLASS = "text-slate-200 font-bold text-xs drop-shadow-md";
const THUMBNAIL_OVERLAY_BADGE_CLASS = "text-white text-xs font-black px-3 py-0.5 rounded-sm shadow-md";
const THUMBNAIL_OVERLAY_TITLE_CLASS =
  "text-3xl md:text-4xl font-black text-white tracking-tight leading-tight line-clamp-2 break-words drop-shadow-md";
const HOME_SEQUENCE_COLUMNS = Number.MAX_SAFE_INTEGER;
const HERO_PROFILE_BLOCK_INDEX = 0;
const HERO_DESCRIPTION_BLOCK_INDEX = 1;

export default function HomePage({ featuredWorks, latestArticles }: HomePageProps) {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const forceCardVisibleOnRestore = useForceCardVisibleOnRestore();
  const homeFeaturedWorks = featuredWorks;
  const homeArticles = latestArticles;
  const hasWorkCarouselLoop = homeFeaturedWorks.length > 1;
  const hasArticleCarouselLoop = homeArticles.length > 1;

  // Loading Screen Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Slideshow Logic
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

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
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Left diagonal overlay */}
        <div 
          className="absolute top-0 left-0 w-full md:w-[65%] lg:w-[55%] h-full bg-white/40 backdrop-blur-sm z-10 pointer-events-none"
          style={{ clipPath: "polygon(0 0, 100% 0, 75% 100%, 0% 100%)" }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 pointer-events-none">
          <div className="max-w-lg pointer-events-auto mt-16 md:mt-0">
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
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">kageki / 歌劇</h1>
                <p className="text-cyan-600 font-bold tracking-wider text-sm mt-1">@kageki128</p>
              </div>
            </motion.div>
            
            <motion.div
              custom={{ index: HERO_DESCRIPTION_BLOCK_INDEX, columns: HOME_SEQUENCE_COLUMNS }}
              variants={cardItemMotionVariants}
              initial="hidden"
              animate={forceCardVisibleOnRestore ? "visibleInstant" : "visible"}
            >
              <p className="text-slate-700 leading-relaxed font-medium mb-5">
                遊び心あふれる体験を創り出すエンジニア兼クリエイター。
                フロントエンドからゲーム開発、サウンド制作まで幅広い分野に手を広げ、
                技術とエンターテインメントの融合を追求しています。
              </p>
              
              <Link href="/about" className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10 bg-white/50 backdrop-blur-sm hover:bg-white/80">
                MORE DETAILS 
                <ArrowRight size={18} />
              </Link>
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
                  <Link href={`/works#work=${work.id}`} className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md hover:shadow-2xl block cursor-pointer border border-slate-100 transition-shadow">
                    {hasText(work.image) ? (
                      <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col items-start text-left">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className={THUMBNAIL_OVERLAY_DATE_CLASS}>{work.date}</span>
                        {work.tags.map((tag) => (
                          <span key={tag} className={`bg-cyan-500 ${THUMBNAIL_OVERLAY_BADGE_CLASS}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className={THUMBNAIL_OVERLAY_TITLE_CLASS}>{work.title}</h4>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
          {homeFeaturedWorks.length === 0 ? (
            <div className="mt-8 text-center text-slate-500 font-semibold">注目作品はまだありません。</div>
          ) : null}
          
          <div className="mt-12 text-center">
            <Link href="/works" className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              VIEW ALL
              <ArrowRight size={18} />
            </Link>
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
                      className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md hover:shadow-2xl block cursor-pointer border border-slate-100 transition-shadow"
                    >
                      {hasText(article.image) ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/35 to-transparent" />

                      <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors z-10">
                        <ExternalLink size={20} />
                      </div>

                      <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col items-start text-left">
                        <div className="flex items-center justify-start gap-3 mb-2.5">
                          <span className={THUMBNAIL_OVERLAY_DATE_CLASS}>{article.date}</span>
                          <span
                            style={{ backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] }}
                            className={THUMBNAIL_OVERLAY_BADGE_CLASS}
                          >
                            {article.platform}
                          </span>
                        </div>
                        <h4 className={THUMBNAIL_OVERLAY_TITLE_CLASS}>{article.title}</h4>
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={article.link}
                      className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md hover:shadow-2xl block cursor-pointer border border-slate-100 transition-shadow"
                    >
                      {hasText(article.image) ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/35 to-transparent" />
                      <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col items-start text-left">
                        <div className="flex items-center justify-start gap-3 mb-2.5">
                          <span className={THUMBNAIL_OVERLAY_DATE_CLASS}>{article.date}</span>
                          <span
                            style={{ backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] }}
                            className={THUMBNAIL_OVERLAY_BADGE_CLASS}
                          >
                            {article.platform}
                          </span>
                        </div>
                        <h4 className={THUMBNAIL_OVERLAY_TITLE_CLASS}>{article.title}</h4>
                      </div>
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
            <Link href="/articles" className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              VIEW ALL
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
