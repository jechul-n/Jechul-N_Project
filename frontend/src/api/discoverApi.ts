import { requestJson } from "./apiClient";
import type { DiscoverResult } from "../types/place";

export interface DiscoverParams {
  keyword: string;
  latitude: number;
  longitude: number;
}

export function getDiscoverResult({
  keyword,
  latitude,
  longitude,
}: DiscoverParams): Promise<DiscoverResult> {
  const params = new URLSearchParams({
    keyword,
    latitude: String(latitude),
    longitude: String(longitude),
  });

  return requestJson<DiscoverResult>("/api/discover", params);
}
