export type AboutTechStackGroup = {
  category: string;
  items: string[];
};

export type AboutActivityWork = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  link: string;
};

export type AboutActivity = {
  title: string;
  description: string;
  imageUrl: string;
  accentColor: string;
  work?: AboutActivityWork;
};

export type AboutOverview = {
  profile: {
    name: string;
    id: string;
  };
  affiliations: string[];
  contact: {
    email: string;
    name: string;
  };
  shortIntroduction: string;
  introduction: string;
  philosophy: string;
  techStackGroups: AboutTechStackGroup[];
};
