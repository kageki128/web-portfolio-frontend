export const ACHIEVEMENT_STORAGE_KEY = "web-portfolio-achievements:v1";

export const ACHIEVEMENTS = [
  {
    id: "first_visit",
    title: "はじめの一歩",
    desc: "初めてサイトを訪れる",
  },
  {
    id: "about_bottom",
    title: "自己紹介、読了",
    desc: "Aboutページを下までスクロールする",
  },
  {
    id: "work_1",
    title: "作品ウォッチャー",
    desc: "作品モーダルを1種類表示する",
  },
  {
    id: "work_3",
    title: "作品ハンター",
    desc: "作品モーダルを3種類表示する",
  },
  {
    id: "interests_bottom",
    title: "趣味の深掘り",
    desc: "Interestsページを下までスクロールする",
  },
  {
    id: "article_1",
    title: "記事デビュー",
    desc: "記事カードを1種類クリックする",
  },
  {
    id: "article_3",
    title: "記事巡回者",
    desc: "記事カードを3種類クリックする",
  },
  {
    id: "otoge_link",
    title: "OTOGEへ出発",
    desc: "OTOGEボタンを押してリンクに飛ぶ",
  },
  {
    id: "happy_secret_command",
    title: "幸せになれる隠しコマンドがあるらしい",
    desc: "→↓↑→ →↓→→ ↑↑↓↓←→←→",
    hideDescUntilUnlocked: true,
  },
  {
    id: "all_complete",
    title: "実績マスター",
    desc: "実績を全て達成する",
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  desc: string;
  hideDescUntilUnlocked?: boolean;
};

export type AchievementProgress = {
  unlockedIds: AchievementId[];
  viewedWorkIds: string[];
  readArticleIds: string[];
};

export const ALL_COMPLETE_ACHIEVEMENT_ID = "all_complete" satisfies AchievementId;

export const BASE_ACHIEVEMENT_IDS = ACHIEVEMENTS.map((achievement) => achievement.id).filter(
  (id) => id !== ALL_COMPLETE_ACHIEVEMENT_ID,
);

export const EMPTY_ACHIEVEMENT_PROGRESS: AchievementProgress = {
  unlockedIds: [],
  viewedWorkIds: [],
  readArticleIds: [],
};
