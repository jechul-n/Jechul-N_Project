export const SEASONAL_CATEGORIES = ["과일", "채소", "수산물", "꽃"] as const;

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
  keyword: string;
  category: SeasonalCategory;
  season: string;
  availableMonths: number[];
}
