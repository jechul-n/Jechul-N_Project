export const SEASONAL_CATEGORIES = ["과일", "해산물", "채소"] as const;

export type SeasonalCategory = (typeof SEASONAL_CATEGORIES)[number];
export type SeasonalCategoryFilter = "전체" | SeasonalCategory;

export interface SeasonalInfo {
  category: SeasonalCategory;
  season: string;
  description: string;
  benefits: string[];
  relatedFoods: string[];
}

export interface SeasonalItem {
  id: number;
  keyword: string;
  category: SeasonalCategory;
  availableMonths: number[];
  featured: boolean;
  mapEnabled: boolean;
  searchQueries: string[];
}
