import type { ABOUT_ACTIVITY_ACCENT_COLORS } from "@/constants/colors";
import type { workItemEntries } from "@/content/works/generated";

type WorkItemId = (typeof workItemEntries)[number][0];
type AboutActivityAccentColorId = keyof typeof ABOUT_ACTIVITY_ACCENT_COLORS;

export type AboutActivitySource = {
  title: string;
  description: string;
  imageUrl: string;
  accentColorId: AboutActivityAccentColorId;
  workId?: WorkItemId;
};

export const aboutActivities = [
  {
    title: "GAME",
    description:
      "UnityとC#を用いてゲームを開発しています。プレイヤーがワクワクするような体験を、強く美しい設計で実装することを目指しています。",
    imageUrl: "",
    workId: "senirenol-bloom",
    accentColorId: "game",
  },
  {
    title: "WEB",
    description:
      "Next.jsやRustなどを用いて、モダンなWebサイトやアプリケーションを開発しています。また、自宅でサーバーを運用し、各種サービスをセルフホストして日々の活動に役立てています。",
    imageUrl: "",
    workId: "web-portfolio-frontend",
    accentColorId: "web",
  },
  {
    title: "ALGORITHM",
    description:
      "プログラミングの基礎力と問題解決力を磨くため、AtCoderの問題に取り組んでいます。まだまだ研鑽の途中です。",
    imageUrl: "/images/about/atcoder.webp",
    accentColorId: "algorithm",
  },
  {
    title: "GRAPHICS",
    description:
      "3DCGを活用した映像を制作しています。そこで培った表現力や技術は、ゲームの絵作りや広報にも活かされています。",
    imageUrl: "",
    workId: "twin-stars-mythology",
    accentColorId: "graphics",
  },
  {
    title: "SOUND",
    description: "ボーカロイド楽曲を制作しています。まだまだ研鑽の途中です。",
    imageUrl: "/images/about/dtm.png",
    accentColorId: "sound",
  },
] satisfies AboutActivitySource[];
