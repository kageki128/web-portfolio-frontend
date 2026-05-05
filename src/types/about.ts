export type AboutTechStackGroup = {
  category: string;
  items: string[];
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
