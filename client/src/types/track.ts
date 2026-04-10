export type SearchType = "youtube" | "spotify";
export type TrackSourceType = SearchType | "telegram";

export type Track = {
  id: number | string;
  title: string;
  author: string;
  cover?: string;
  sourceId?: string;
  watchUrl?: string;
  sourceType: TrackSourceType;
};