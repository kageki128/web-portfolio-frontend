/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { BadgeCheck, BookOpen, Calendar, ExternalLink, Users, Wrench, X } from "lucide-react";
import { SiteBadge } from "@/components/site/SiteBadge";
import { getWorkTagThemeColor } from "@/constants/colors";
import { hasText } from "@/lib/text";
import type { WorkItem } from "@/types/works";

const WORK_IMAGE_ASPECT_CLASS = "aspect-[16/9]";

type WorkModalProps = {
  work: WorkItem;
  onClose: () => void;
};

export function WorkModal({ work, onClose }: WorkModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-y-auto flex flex-col max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
          aria-label="詳細モーダルを閉じる"
        >
          <X size={20} />
        </button>

        <div className={`w-full ${WORK_IMAGE_ASPECT_CLASS} bg-slate-900 relative shrink-0 overflow-hidden`}>
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="text-slate-200 font-bold text-xs">{work.date}</div>
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
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight break-words">
                {work.title}
              </h2>
              {hasText(work.link) ? (
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 self-end items-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-full font-bold tracking-widest transition-colors shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                >
                  VIEW <ExternalLink size={18} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex shrink-0 self-end items-center gap-3 bg-slate-500 text-white px-6 py-3 rounded-full font-bold tracking-widest cursor-not-allowed opacity-80"
                >
                  NO LINK
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wider">OVERVIEW</h3>
            <p className="text-slate-700 leading-relaxed font-medium text-lg">{work.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <Users className="text-cyan-500 mt-1 shrink-0" size={24} />
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">MEMBERS</div>
                <div className="font-medium text-slate-800">{work.members}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <BadgeCheck className="text-cyan-500 mt-1 shrink-0" size={24} />
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">ROLE</div>
                <div className="font-medium text-slate-800">{work.role}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <Wrench className="text-cyan-500 mt-1 shrink-0" size={24} />
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">TECH STACK</div>
                <div className="font-medium text-slate-800">{work.tech}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <Calendar className="text-cyan-500 mt-1 shrink-0" size={24} />
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">DURATION</div>
                <div className="font-medium text-slate-800">{work.duration}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-cyan-500" />
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
                    className="group flex items-center gap-3 text-slate-700 hover:text-cyan-600 font-medium transition-colors p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  >
                    <ExternalLink
                      size={18}
                      className="text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0"
                    />
                    <span className="line-clamp-1">{hasText(article.title) ? article.title : article.link}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-medium">関連記事はありません。</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
