import { requestJson } from "./apiClient";
import type { SeasonalCategory, SeasonalItem } from "../types/seasonal";

interface SeasonalItemsResponse {
  success: boolean;
  items: SeasonalItem[];
  featured: SeasonalItem[];
  message?: string;
}

type CurrentSeasonalItemsResponse = SeasonalItemsResponse;

export interface SeasonalItemsParams {
  month?: number;
  category?: SeasonalCategory;
}

export function getCurrentSeasonalItems(): Promise<CurrentSeasonalItemsResponse> {
  return requestJson<CurrentSeasonalItemsResponse>("/api/seasonal/current");
}

export function getSeasonalItems({
  month,
  category,
}: SeasonalItemsParams): Promise<SeasonalItemsResponse> {
  const params = new URLSearchParams();

  if (month) {
    params.set("month", String(month));
  }

  if (category) {
    params.set("category", category);
  }

  return requestJson<SeasonalItemsResponse>("/api/seasonal", params);
}
