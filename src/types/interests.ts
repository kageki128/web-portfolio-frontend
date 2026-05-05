export type InterestItem = {
  id: string;
  name: string;
  image: string;
  link: string;
};

export type InterestCategory = {
  category: string;
  iconId: string;
  items: InterestItem[];
};
