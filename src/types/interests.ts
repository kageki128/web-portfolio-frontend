export type InterestIconKey = "games" | "music" | "video" | "books" | "others";

export type InterestItem = {
  id: string;
  name: string;
  image: string;
  link: string;
};

export type InterestCategory = {
  category: string;
  iconKey: InterestIconKey;
  items: InterestItem[];
};
