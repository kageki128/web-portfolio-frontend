import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MonitorPlay, X } from "lucide-react";

type ExperienceBannerProps = {
  isOpen: boolean;
  onClose: () => void;
  onExpand: () => void;
};

export function ExperienceBanner({ isOpen, onClose, onExpand }: ExperienceBannerProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-white rounded-xl shadow-2xl shadow-cyan-500/10 border-2 border-cyan-500 p-6 pr-12 relative overflow-hidden w-72">
              <div className="absolute top-0 right-0 p-3">
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-800 transition-colors"
                  aria-label="体験バナーを閉じる"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-lg font-black mb-1 text-slate-800">初めてですか？</h3>
              <p className="text-sm text-slate-500 mb-4 font-medium">私を「体験」してみませんか？</p>

              <Link
                href="/otoge"
                onNavigate={onClose}
                className="flex items-center justify-center gap-2 bg-cyan-500 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-cyan-600 transition-colors w-full shadow-lg shadow-cyan-500/20"
              >
                <MonitorPlay size={16} />
                EXPERIENCE NOW
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? null : (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            onClick={onExpand}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-xl shadow-cyan-500/35 hover:bg-cyan-600 transition-colors flex items-center justify-center"
            aria-label="体験バナーを開く"
            title="体験バナーを開く"
          >
            <MonitorPlay size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
