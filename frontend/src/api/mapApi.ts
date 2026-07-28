import { requestJson } from "./apiClient";
import type { Place } from "../types/place";
import type { SeasonalCategory } from "../types/seasonal";

interface MapPlacesResponse {
  success: boolean;
  places: Place[];
  message?: string;
}

export interface MapPlacesParams {
  latitude: number;
  longitude: number;
  month?: number;
  category?: SeasonalCategory;
}

export function getMapPlaces({
  latitude,
  longitude,
  month,
  category,
}: MapPlacesParams): Promise<MapPlacesResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  if (month) {
    params.set("month", String(month));
  }

  if (category) {
    params.set("category", category);
  }

  return requestJson<MapPlacesResponse>("/api/map/places", params);
}
