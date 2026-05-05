export type WorkRelatedArticle = {
  title: string;
  url: string;
};

export type WorkItem = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  date: string;
  desc: string;
  role: string;
  tech: string;
  duration: string;
  members: string;
  link: string;
  year: number;
  relatedArticles: WorkRelatedArticle[];
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
