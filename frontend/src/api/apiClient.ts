export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

export function createApiUrl(path: string, params?: URLSearchParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const queryString = params?.toString();

  return `${getApiBaseUrl()}${normalizedPath}${
    queryString ? `?${queryString}` : ""
  }`;
}

export async function requestJson<T>(
  path: string,
  params?: URLSearchParams
): Promise<T> {
  const response = await fetch(createApiUrl(path, params));
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "요청을 처리하지 못했습니다.";

    throw new ApiRequestError(message, response.status);
  }

  return payload as T;
}
