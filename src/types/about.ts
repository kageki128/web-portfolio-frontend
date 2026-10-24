export type AboutTechStackGroup = {
  category: string;
  items: string[];
};

export type AboutAffiliation = {
  name: string;
  href: string;
};

export type AboutCareerEntry = {
  startDate: string;
  endDate: string;
  company: string;
  programName: string;
  role: string;
  href?: string;
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
  affiliations: AboutAffiliation[];
  contact: {
    email: string;
    name: string;
  };
  shortIntroduction: string;
  introduction: string;
  philosophy: string;
  techStackGroups: AboutTechStackGroup[];
  careerEntries: AboutCareerEntry[];
};
