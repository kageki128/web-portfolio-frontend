export const ACHIEVEMENT_STORAGE_KEY = "web-portfolio-achievements:v1";

export const ACHIEVEMENTS = [
  {
    id: "first_visit",
    title: "はじめまして！",
    desc: "初めてサイトを訪れる",
  },
  {
    id: "about_bottom",
    title: "ただの人間には興味ありません",
    desc: "Aboutページを全て閲覧する",
  },
  {
    id: "work_1",
    title: "今まで何してたんだ？",
    desc: "作品を1つ閲覧する",
    counter: {
      progressKey: "viewedWorkIds",
      target: 1,
    },
  },
  {
    id: "work_5",
    title: "次回作にご期待ください",
    desc: "作品を5つ閲覧する",
    counter: {
      progressKey: "viewedWorkIds",
      target: 5,
    },
  },
  {
    id: "interests_bottom",
    title: "よく学び よく遊ぶ",
    desc: "Interestsページを全て閲覧する",
  },
  {
    id: "article_1",
    title: "備忘録",
    desc: "記事を1つ閲覧する",
    counter: {
      progressKey: "readArticleIds",
      target: 1,
    },
  },
  {
    id: "article_5",
    title: "愛読者",
    desc: "記事を5つ閲覧する",
    counter: {
      progressKey: "readArticleIds",
      target: 5,
    },
  },
  {
    id: "otoge_link",
    title: "三度の飯より音ゲー",
    desc: "OTOGEをプレイする",
  },
  {
    id: "happy_secret_command",
    title: "幸せになれる隠しコマンドがあるらしい",
    desc: "→↓↑→ →↓→→ ↑↑↓↓←→←→",
    hideDescUntilUnlocked: true,
  },
  {
    id: "all_complete",
    title: "歌劇派",
    desc: "実績を全て達成する",
  },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  desc: string;
  hideDescUntilUnlocked?: boolean;
  counter?: {
    progressKey: keyof Pick<AchievementProgress, "viewedWorkIds" | "readArticleIds">;
    target: number;
  };
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
