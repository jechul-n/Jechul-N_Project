export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  distance: number;
  latitude: number;
  longitude: number;
  placeUrl: string;
  relatedKeyword?: string;
  relatedKeywords?: string[];
}

export interface DiscoverResult {
  success: boolean;
  keyword: string;
  description?: string;
  seasonalInfo?: import("./seasonal").SeasonalInfo;
  places: Place[];
  placeSearchFailed?: boolean;
  message?: string;
}
