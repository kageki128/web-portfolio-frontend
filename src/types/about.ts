export type AboutTechStackGroup = {
  category: string;
  items: string[];
};

export type AboutActivity = {
  title: string;
  description: string;
  imageUrl: string;
  accentColor: string;
};

export type AboutOverview = {
  profile: {
    name: string;
    id: string;
  };
  affiliations: string[];
  introduction: string;
  philosophy: string;
  techStackGroups: AboutTechStackGroup[];
};
