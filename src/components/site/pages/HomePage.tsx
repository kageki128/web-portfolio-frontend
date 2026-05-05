/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowRight, ArrowDown, ExternalLink } from "lucide-react";
import Slider from "react-slick";
import { SectionTitle } from "../SectionTitle";
import { ARTICLE_PLATFORM_COLORS } from "@/constants/colors";
import { PROFILE_ICON_PATH } from "@/constants/assets";
import type { ArticlePlatform } from "@/types/articles";

// Mock Images
const slides = [
  "https://images.unsplash.com/photo-1719516937211-7d70087dd03d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHN0eWxlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NzgwOTQyNHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1760539620142-70bcd136b5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0YWdlJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3NzgwOTQyNHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1713188090500-a4fb0d2cf309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGRpZ2l0YWwlMjBhcnR8ZW58MXx8fHwxNzc3ODA5NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const featuredWorks = [
  { id: 1, title: "Stellarium Project", category: "Game", date: "2026.05.01", tags: ["Game", "Unity"], image: slides[0] },
  { id: 2, title: "Neon Beat", category: "Sound", date: "2026.04.20", tags: ["Music", "Unity"], image: slides[1] },
  { id: 3, title: "Chrono Visualizer", category: "Web", date: "2026.04.10", tags: ["Web", "React"], image: slides[2] },
  { id: 4, title: "Echoes of Time", category: "Game", date: "2026.03.15", tags: ["Game", "UE5"], image: slides[0] },
  { id: 5, title: "Pixel Journey", category: "Web", date: "2026.02.28", tags: ["Web", "Design"], image: slides[1] },
];

type HomeArticle = {
  id: number;
  title: string;
  date: string;
  platform: ArticlePlatform;
  image: string;
};

const articles: HomeArticle[] = [
  { id: 1, title: "Unity WebGLで音ゲーを作る", date: "2026.04.15", platform: "Zenn", image: "https://images.unsplash.com/photo-1704969723990-2810977e9fe7?auto=format&fit=crop&w=600&q=80" },
  { id: 2, title: "シェーダーで遊ぶ：パーティクル表現", date: "2026.03.22", platform: "Qiita", image: "https://images.unsplash.com/photo-1638561186238-3227892dbc18?auto=format&fit=crop&w=600&q=80" },
  { id: 3, title: "ReactとTailwindでモダンなUIを構築する", date: "2026.02.10", platform: "traP", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
  { id: 4, title: "サウンドデザインの基礎", date: "2026.01.05", platform: "Blog", image: "https://images.unsplash.com/photo-1516280440502-864dd1f6ccb9?auto=format&fit=crop&w=600&q=80" },
];

type ArrowProps = {
  onClick?: () => void;
};

const NextArrow = (props: ArrowProps) => {
  const { onClick } = props;
  return (
    <div className="absolute right-[10%] sm:right-[15%] lg:right-[20%] xl:right-[25%] top-0 bottom-8 z-20 flex items-center justify-center translate-x-1/2 pointer-events-none">
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
    <div className="absolute left-[10%] sm:left-[15%] lg:left-[20%] xl:left-[25%] top-0 bottom-8 z-20 flex items-center justify-center -translate-x-1/2 pointer-events-none">
      <button 
        onClick={onClick} 
        className="text-slate-300 hover:text-cyan-500 transition-all pointer-events-auto hover:scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        <ChevronLeft size={64} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
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
              infinite={true} 
              centerMode={true}
              centerPadding="25%"
              speed={600} 
              slidesToShow={1} 
              slidesToScroll={1} 
              autoplay={true} 
              autoplaySpeed={3500} 
              nextArrow={<NextArrow />} 
              prevArrow={<PrevArrow />}
              responsive={[
                { breakpoint: 1280, settings: { slidesToShow: 1, centerPadding: '20%' } },
                { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '15%' } },
                { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '10%' } }
              ]}
            >
              {featuredWorks.map((work) => (
                <div key={work.id} className="px-3 sm:px-6 md:px-10 pb-8">
                  <Link href="/works" className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-xl shadow-slate-200/50 block cursor-pointer border border-slate-200">
                    <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform flex flex-col items-start text-left">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {work.tags.map(tag => (
                          <span key={tag} className="bg-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm drop-shadow-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-2xl font-black text-white drop-shadow-md">{work.title}</h4>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/works" className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              VIEW ALL WORKS
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
              infinite={true} 
              centerMode={true}
              centerPadding="25%"
              speed={600} 
              slidesToShow={1} 
              slidesToScroll={1} 
              autoplay={true} 
              autoplaySpeed={4000} 
              nextArrow={<NextArrow />} 
              prevArrow={<PrevArrow />}
              responsive={[
                { breakpoint: 1280, settings: { slidesToShow: 1, centerPadding: '20%' } },
                { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '15%' } },
                { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '10%' } }
              ]}
            >
              {articles.map((article) => (
                <div key={article.id} className="px-3 sm:px-6 md:px-10 pb-8">
                  <Link href="/articles" className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-xl shadow-slate-200/50 block cursor-pointer border border-slate-200">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute bottom-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors z-10">
                      <ExternalLink size={20} />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform flex flex-col items-start text-left">
                      <div className="flex items-center justify-start gap-3 mb-2">
                        <span className="text-slate-300 text-xs font-bold drop-shadow-md">{article.date}</span>
                        <span
                          style={{ backgroundColor: ARTICLE_PLATFORM_COLORS[article.platform] }}
                          className="text-white text-[10px] font-black px-2 py-0.5 rounded-sm drop-shadow-md"
                        >
                          {article.platform}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-white drop-shadow-md">{article.title}</h4>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/articles" className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-500 px-8 py-3.5 rounded-full font-bold tracking-widest text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              VIEW ALL ARTICLES
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
