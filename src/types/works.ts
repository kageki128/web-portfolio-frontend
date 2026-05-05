export type WorkRelatedArticle = {
  title: string;
  link: string;
};

export type WorkItem = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  image: string;
  desc: string;
  members: string;
  role: string;
  tech: string;
  duration: string;
  articles: WorkRelatedArticle[];
  link: string;
};

export type WorksYearSection = {
  year: number;
  itemIds: string[];
};

export type WorksIndex = {
  featuredIds: string[];
  yearSections: WorksYearSection[];
};

export type WorksYearGroup = {
  year: number;
  items: WorkItem[];
};
