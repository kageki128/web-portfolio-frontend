/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { SectionTitle } from "../SectionTitle";

type ActivityEntry = {
  title: string;
  description: string;
  imageUrl: string;
  workName: string;
  accentColor: string;
};

type TechStackGroup = {
  category: string;
  items: string[];
};

type ActivityCardProps = {
  activity: ActivityEntry;
  index: number;
  isActive: boolean;
};

const MIN_HIGHLIGHT_VISIBLE_RATIO = 0.25;
const ACTIVITY_DIAGONAL_OFFSET = "8vw";

const PROFILE = {
  name: "Taro Creator",
  role: "Game & Web Developer",
  imageUrl:
    "https://images.unsplash.com/photo-1697205153149-a60e3a2ddc61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBnaXJsfGVufDF8fHx8MTc3NzgwOTQyNHww&ixlib=rb-4.1.0&q=80&w=400",
};

const TECH_STACK_GROUPS: TechStackGroup[] = [
  { category: "Frontend", items: ["React", "Next.js", "TailwindCSS", "TypeScript"] },
  { category: "Game", items: ["Unity", "C#", "Unreal Engine"] },
  { category: "Backend", items: ["Node.js", "Supabase", "Go", "Python"] },
  { category: "Creative", items: ["Figma", "Blender", "Logic Pro"] },
];

const ACTIVITY_ENTRIES: ActivityEntry[] = [
  {
    title: "Game",
    description:
      "Unityを用いた3Dアクションゲームや、WebGL向けのリズムゲームなどを開発。プレイヤーの手触り感と気持ちよさにこだわったレベルデザインと演出を得意としています。",
    imageUrl:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzc3ODg3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    workName: "Neon Pulse (Rhythm Game)",
    accentColor: "#7733AA",
  },
  {
    title: "Web",
    description:
      "React/Next.jsをベースとしたモダンなWebアプリケーション開発。アニメーションを多用したリッチなUI/UX設計から、バックエンド連携まで一貫して構築します。",
    imageUrl:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ258ZW58MXx8fHwxNzc3ODg2Mjg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    workName: "Stellarium Portfolio",
    accentColor: "#14A39E",
  },
  {
    title: "Algorithm",
    description:
      "競技プログラミングでの経験を活かし、複雑なデータ処理や最適化アルゴリズムを実装。ゲーム内のAIロジックや、大量のオブジェクト処理などに応用しています。",
    imageUrl:
      "https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGdvcml0aG0lMjBjb2RlfGVufDF8fHx8MTc3Nzg4NzQxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    workName: "Pathfinding Visualizer",
    accentColor: "#B02525",
  },
  {
    title: "Graphics",
    description:
      "シェーダープログラミング（HLSL/GLSL）による多彩な視覚表現や、パーティクルシステムを用いたVFX制作。ゲームの世界観を決定づけるルックデヴを行います。",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMGdyYXBoaWNzfGVufDF8fHx8MTc3Nzg4NzQxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    workName: "Toon Shader Package",
    accentColor: "#F47FAD",
  },
  {
    title: "Sound",
    description:
      "シンセサイザーを用いたBGM制作や効果音（SE）の作成。映像やゲームの展開に合わせたインタラクティブミュージックの実装にも取り組んでいます。",
    imageUrl:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y3Rpb258ZW58MXx8fHwxNzc3ODg3NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    workName: "Cyber City Soundtrack",
    accentColor: "#FF7B19",
  },
];

function calculateVisibleHeight(elementRect: DOMRect, viewportHeight: number): number {
  const visibleTop = Math.max(elementRect.top, 0);
  const visibleBottom = Math.min(elementRect.bottom, viewportHeight);
  return Math.max(0, visibleBottom - visibleTop);
}

function getMostVisibleActivity(elements: Array<HTMLDivElement | null>, viewportHeight: number) {
  let mostVisibleIndex: number | null = null;
  let maxVisibleHeight = 0;

  elements.forEach((element, index) => {
    if (!element) {
      return;
    }

    const visibleHeight = calculateVisibleHeight(element.getBoundingClientRect(), viewportHeight);
    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      mostVisibleIndex = index;
    }
  });

  return { mostVisibleIndex, maxVisibleHeight };
}

function useActiveActivityHighlight() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activityRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let rafId = 0;

    const updateActiveActivity = () => {
      const viewportHeight = window.innerHeight;
      const { mostVisibleIndex, maxVisibleHeight } = getMostVisibleActivity(
        activityRefs.current,
        viewportHeight,
      );

      if (maxVisibleHeight <= viewportHeight * MIN_HIGHLIGHT_VISIBLE_RATIO) {
        setActiveIndex(null);
        return;
      }

      setActiveIndex(mostVisibleIndex);
    };

    const handleViewportChange = () => {
      // scroll/resizeイベントをrAFで束ねて、連続計算を抑える。
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveActivity);
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    updateActiveActivity();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  const setActivityRef = useCallback((index: number, element: HTMLDivElement | null) => {
    activityRefs.current[index] = element;
  }, []);

  return { activeIndex, setActivityRef };
}

function SubsectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-xl font-black font-heading text-slate-800 mb-6 flex items-center gap-3">
      <span className="w-1.5 h-6 bg-cyan-500 inline-block" />
      {title}
    </h3>
  );
}

function getActivityClipPath(isEvenIndex: boolean) {
  return isEvenIndex
    ? `polygon(0 0, 100% ${ACTIVITY_DIAGONAL_OFFSET}, 100% calc(100% - ${ACTIVITY_DIAGONAL_OFFSET}), 0 100%)`
    : `polygon(0 ${ACTIVITY_DIAGONAL_OFFSET}, 100% 0, 100% 100%, 0 calc(100% - ${ACTIVITY_DIAGONAL_OFFSET}))`;
}

function getAccentTransformOrigin(isEvenIndex: boolean, isActive: boolean) {
  if (isEvenIndex) {
    return isActive ? "left" : "right";
  }

  return isActive ? "right" : "left";
}

const ActivityCard = forwardRef<HTMLDivElement, ActivityCardProps>(function ActivityCard(
  { activity, index, isActive },
  ref,
) {
  const isEvenIndex = index % 2 === 0;
  const clipPath = getActivityClipPath(isEvenIndex);

  return (
    <div
      ref={ref}
      className={`w-full ${index > 0 ? "-mt-[8vw]" : ""} relative transition-colors duration-300 ease-in-out`}
      style={{ clipPath }}
    >
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          backgroundColor: activity.accentColor,
          transformOrigin: getAccentTransformOrigin(isEvenIndex, isActive),
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-32 md:py-40 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className={`flex flex-col ${isEvenIndex ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 group`}
        >
          <div
            className={`w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl relative border transition-colors duration-300 ${isActive ? "border-white/20" : "border-slate-200"}`}
          >
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div
                className={`backdrop-blur-sm text-white font-heading font-black text-[10px] px-3 py-1 rounded-sm drop-shadow-md border transition-colors duration-300 ${isActive ? "bg-white/20 border-white/30" : "bg-cyan-500 border-transparent"}`}
              >
                WORK: {activity.workName}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div
              className={`text-5xl font-black font-heading mb-2 transition-colors duration-300 ${isActive ? "text-white/30" : "text-slate-200"}`}
            >
              0{index + 1}
            </div>
            <h3
              className={`text-3xl font-black font-heading mb-4 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-800"}`}
            >
              {activity.title}
            </h3>
            <p
              className={`leading-loose font-medium max-w-lg transition-colors duration-300 ${isActive ? "text-white/90" : "text-slate-600"}`}
            >
              {activity.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default function AboutPage() {
  const { activeIndex, setActivityRef } = useActiveActivityHighlight();

  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="ABOUT" subtitle="私について" />

        <section className="mt-20 mb-32">
          <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-800 mb-12 inline-block border-b-4 border-cyan-500 pb-2">
            OVERVIEW
          </h2>

          <div className="flex flex-col gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubsectionTitle title="PROFILE" />

              <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-cyan-50 shrink-0">
                  <img src={PROFILE.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-4xl font-black font-heading text-slate-800 tracking-tight">
                    {PROFILE.name}
                  </h1>
                  <p className="text-cyan-600 font-bold font-heading tracking-wider text-sm mt-1">
                    {PROFILE.role}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 leading-loose font-medium max-w-3xl">
                こんにちは！ゲームとWebの世界を行き来するエンジニア・クリエイターのTaroです。
                「触って楽しい、見て美しい」をモットーに、技術とエンターテインメントの交差点で様々な作品を作り続けています。
                フロントエンドの心地よいインタラクション設計から、ゲームのコアロジック実装、果てはサウンド制作まで、
                好奇心の赴くままに幅広い分野に挑戦しています。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubsectionTitle title="PHILOSOPHY" />
              <p className="text-slate-600 leading-loose font-medium max-w-3xl">
                「遊び心」は最高のスパイスであると信じています。
                どんなに実用的なツールでも、どこかにフフッと笑える要素や、無駄に触りたくなる気持ちよさがあるべきです。
                ユーザーの期待を超える驚きと、細部までこだわり抜いた実装で、記憶に残る体験を創り出すことを目指しています。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubsectionTitle title="TECH STACK" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {TECH_STACK_GROUPS.map((stackGroup) => (
                  <div key={stackGroup.category}>
                    <div className="text-cyan-500 font-black font-heading text-sm mb-3 border-b-2 border-slate-100 pb-2 inline-block pr-8">
                      {stackGroup.category}
                    </div>
                    <ul className="text-slate-600 font-medium text-sm leading-loose">
                      {stackGroup.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section className="mb-32 w-full">
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-800 inline-block border-b-4 border-cyan-500 pb-2">
            ACTIVITIES
          </h2>
        </div>

        <div className="flex flex-col">
          {ACTIVITY_ENTRIES.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              ref={(element) => setActivityRef(index, element)}
              activity={activity}
              index={index}
              isActive={activeIndex === index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
