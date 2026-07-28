export type StoredItemType = "keyword" | "place";

export interface StoredKeywordItem {
  id: string;
  type: "keyword";
  keyword: string;
  category?: string;
  season?: string;
  savedAt: string;
}

export interface StoredPlaceItem {
  id: string;
  type: "place";
  placeId: string;
  name: string;
  address: string;
  category?: string;
  relatedKeyword?: string;
  latitude?: number;
  longitude?: number;
  placeUrl?: string;
  savedAt: string;
}

export type SavedItem = StoredKeywordItem | StoredPlaceItem;
export type RecentItem = SavedItem;

export interface SaveKeywordInput {
  keyword: string;
  category?: string;
  season?: string;
}

export interface SavePlaceInput {
  placeId: string;
  name: string;
  address: string;
  category?: string;
  relatedKeyword?: string;
  latitude?: number;
  longitude?: number;
  placeUrl?: string;
}
