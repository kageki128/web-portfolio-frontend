/* eslint-disable @next/next/no-img-element */
"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Music, Video, BookOpen, ExternalLink } from "lucide-react";
import { SectionTitle } from "../SectionTitle";

type FavoriteItem = {
  id: string;
  name: string;
  image: string;
  link: string;
  desc: string;
};

type FavoriteCategory = {
  category: string;
  icon: ReactNode;
  items: FavoriteItem[];
};

const favoritesData: FavoriteCategory[] = [
  {
    category: "Game",
    icon: <Gamepad2 size={32} className="text-cyan-500" />,
    items: [
      { 
        id: "g1",
        name: "Cyberpunk 2077", 
        image: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5fGVufDF8fHx8MTc3Nzg5Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "圧倒的な没入感と作り込まれたナイトシティの世界観。メインストーリーはもちろん、サイドジョブのシナリオの深さにも引き込まれました。",
      },
      { 
        id: "g2",
        name: "Hollow Knight", 
        image: "https://images.unsplash.com/photo-1709650010438-6f07840a1411?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY2F2ZSUyMG5hdHVyZXxlbnwxfHx8fDE3Nzc4OTY5NjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "美しい手描きのアートスタイルと、歯ごたえのある難易度。探索の面白さと、徐々に明らかになる寂寥感のあるストーリーが魅力的です。",
      },
      { 
        id: "g3",
        name: "Beat Saber", 
        image: "https://images.unsplash.com/photo-1770177267441-1d8dadda4feb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ciUyMG5lb258ZW58MXx8fHwxNzc3ODk2OTYwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "VRリズムゲームの金字塔。直感的な操作感と音楽に乗ってブロックを斬る爽快感は、何度プレイしても飽きません。",
      },
    ]
  },
  {
    category: "Music",
    icon: <Music size={32} className="text-cyan-500" />,
    items: [
      { 
        id: "m1",
        name: "Electronic & Synthwave", 
        image: "https://images.unsplash.com/photo-1608347539243-b592b14332d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeW50aHdhdmUlMjBuZW9ufGVufDF8fHx8MTc3Nzg5Njk2MHww&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "作業用BGMとしてよく聴くジャンル。レトロフューチャーなシンセの音色や、疾走感のあるビートが集中力を高めてくれます。",
      },
      { 
        id: "m2",
        name: "Game Soundtracks", 
        image: "https://images.unsplash.com/photo-1767216398625-84529a6c5f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoZXN0cmFsJTIwY29uY2VydHxlbnwxfHx8fDE3Nzc4OTY5NjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "お気に入りのゲームのサントラ。シーンの感情を増幅させるオーケストラアレンジや、ボス戦のエピックな楽曲が好きです。",
      },
    ]
  },
  {
    category: "Anime",
    icon: <Video size={32} className="text-cyan-500" />,
    items: [
      { 
        id: "a1",
        name: "攻殻機動隊 Edgerunners", 
        image: "https://images.unsplash.com/photo-1558473840-767aaeeeae45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBhbmltZXxlbnwxfHx8fDE3Nzc4OTY5NjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "サイバーパンク2077のスピンオフアニメ。スタイリッシュな映像表現と、TRIGGERならではの熱い展開、切ない結末が最高でした。",
      },
      { 
        id: "a2",
        name: "STEINS;GATE", 
        image: "https://images.unsplash.com/photo-1707532522077-b75173f2ec94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lJTIwbWFjaGluZSUyMGNsb2NrfGVufDF8fHx8MTc3Nzg5Njk2MXww&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "タイムトラベルものの傑作。前半の日常パートからの、後半の怒涛の伏線回収とシリアスな展開の落差に完全に引き込まれます。",
      },
    ]
  },
  {
    category: "Books",
    icon: <BookOpen size={32} className="text-cyan-500" />,
    items: [
      { 
        id: "b1",
        name: "ゲームメカニクス", 
        image: "https://images.unsplash.com/photo-1764096535068-0e9f652e03f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwZGVzaWduJTIwdGV4dGJvb2t8ZW58MXx8fHwxNzc3ODk2OTYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "ゲームデザインを体系的に学べる一冊。ルールの構築やバランス調整の考え方など、制作における理論的なアプローチが参考になります。",
      },
      { 
        id: "b2",
        name: "SF小説全般", 
        image: "https://images.unsplash.com/photo-1612094264296-0a0fc161e367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYWxheHklMjBib29rc3xlbnwxfHx8fDE3Nzc4OTY5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        link: "#",
        desc: "新しい技術や未知の世界を想像するSF小説が好きです。世界観の構築やストーリーテリングのインスピレーション源になっています。",
      },
    ]
  },
];

export default function FavoritesPage() {
  return (
    <div className="w-full min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle title="FAVORITES" subtitle="お気に入り" />
        
        <div className="mt-20 flex flex-col space-y-24">
          {favoritesData.map((fav) => (
            <section key={fav.category}>
              <div className="flex items-center gap-4 mb-10 border-b-4 border-cyan-500 pb-3 inline-flex">
                {fav.icon}
                <h2 className="text-3xl md:text-4xl font-black text-slate-800">
                  {fav.category}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {fav.items.map(item => (
                  <motion.a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    key={item.id}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 transition-all hover:-translate-y-2"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                    <div className="p-6 relative">
                      <div className="absolute top-6 right-6 text-slate-300 group-hover:text-cyan-500 transition-colors">
                        <ExternalLink size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 text-left leading-[1.5] group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3em] mb-3 pr-8">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed text-left line-clamp-3 min-h-[4.5em]">
                        {item.desc}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
