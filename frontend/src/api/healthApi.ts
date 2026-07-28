import { requestJson } from "./apiClient";

interface HealthResponse {
  success: boolean;
  message: string;
}

export function getHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>("/api/health");
}
