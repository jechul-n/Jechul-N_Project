import { requestJson } from "./apiClient";
import type { SeasonalCategory, SeasonalItem } from "../types/seasonal";

interface SeasonalItemsResponse {
  success: boolean;
  items: SeasonalItem[];
  message?: string;
}

export interface SeasonalItemsParams {
  month?: number;
  category?: SeasonalCategory;
}

export function getCurrentSeasonalItems(): Promise<SeasonalItemsResponse> {
  return requestJson<SeasonalItemsResponse>("/api/seasonal/current");
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
