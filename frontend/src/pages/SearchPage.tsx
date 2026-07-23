import { useState } from "react";
import type { ComponentProps } from "react";

type FormSubmitEvent = Parameters<
  NonNullable<ComponentProps<"form">["onSubmit"]>
>[0];

type Place = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  distance: number;
  latitude: number;
  longitude: number;
  placeUrl: string;
};

type DiscoverResult = {
  success: boolean;
  keyword: string;
  description: string;
  places: Place[];
  message?: string;
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("현재 위치 기능을 지원하지 않는 브라우저입니다."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

function formatDistance(distance: number) {
  if (distance < 1000) {
    return `${distance}m`;
  }

  return `${(distance / 1000).toFixed(1)}km`;
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    if (error.code === 1) {
      return "주변 장소를 찾으려면 브라우저의 위치 권한을 허용해 주세요.";
    }

    if (error.code === 2) {
      return "현재 위치를 확인하지 못했습니다.";
    }

    if (error.code === 3) {
      return "현재 위치 확인 시간이 초과되었습니다.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "검색 중 오류가 발생했습니다.";
}

function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (event: FormSubmitEvent) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setErrorMessage("검색어를 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setErrorMessage("");
    setStatusMessage("현재 위치를 확인하고 있어요.");

    try {
      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setStatusMessage("AI 설명과 주변 장소를 찾고 있어요.");

      const params = new URLSearchParams({
        keyword: trimmedKeyword,
        latitude: String(latitude),
        longitude: String(longitude),
      });

      const response = await fetch(
        `http://localhost:3000/api/discover?${params.toString()}`
      );

      const data = (await response.json()) as DiscoverResult;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "검색 요청에 실패했습니다.");
      }

      setResult(data);
      setStatusMessage("");
    } catch (error) {
      console.error("검색 오류:", error);
      setErrorMessage(getErrorMessage(error));
      setStatusMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <header style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 8px" }}>제철 검색</h1>

        <p
          style={{
            margin: 0,
            color: "#666666",
          }}
        >
          제철 음식, 과일, 수산물과 꽃을 검색해 보세요.
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="예: 딸기, 전어, 수국"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "14px 16px",
            border: "1px solid #dddddd",
            borderRadius: "12px",
            fontSize: "16px",
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "14px 20px",
            border: "none",
            borderRadius: "12px",
            backgroundColor: "#ff6b35",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: isLoading ? "default" : "pointer",
            opacity: isLoading ? 0.65 : 1,
          }}
        >
          {isLoading ? "검색 중" : "검색"}
        </button>
      </form>

      {statusMessage && (
        <p
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#f5f7f9",
            color: "#444444",
          }}
        >
          {statusMessage}
        </p>
      )}

      {errorMessage && (
        <p
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "#fff0f0",
            color: "#cc3333",
          }}
        >
          {errorMessage}
        </p>
      )}

      {result && (
        <>
          <section
            style={{
              marginBottom: "32px",
              padding: "22px",
              borderRadius: "18px",
              backgroundColor: "#fff5ef",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#ff6b35",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              AI 제철 설명
            </p>

            <h2
              style={{
                margin: "0 0 12px",
              }}
            >
              {result.keyword}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#444444",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {result.description}
            </p>
          </section>

          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 5px",
                  }}
                >
                  주변 {result.keyword} 관련 장소
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#777777",
                    fontSize: "14px",
                  }}
                >
                  현재 위치에서 가까운 순서예요.
                </p>
              </div>

              <span
                style={{
                  flexShrink: 0,
                  color: "#777777",
                  fontSize: "14px",
                }}
              >
                {result.places.length}곳
              </span>
            </div>

            {result.places.length === 0 ? (
              <p
                style={{
                  padding: "20px",
                  borderRadius: "14px",
                  backgroundColor: "#f5f7f9",
                  color: "#666666",
                }}
              >
                현재 위치 주변에서 관련 장소를 찾지 못했어요.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {result.places.map((place) => (
                  <article
                    key={place.id}
                    style={{
                      padding: "18px",
                      border: "1px solid #eeeeee",
                      borderRadius: "16px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            margin: "0 0 7px",
                          }}
                        >
                          {place.name}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 5px",
                            color: "#666666",
                            fontSize: "14px",
                          }}
                        >
                          {place.address || "주소 정보 없음"}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#888888",
                            fontSize: "13px",
                          }}
                        >
                          {place.category}
                        </p>
                      </div>

                      <strong
                        style={{
                          flexShrink: 0,
                          color: "#ff6b35",
                          fontSize: "14px",
                        }}
                      >
                        {formatDistance(place.distance)}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "16px",
                      }}
                    >
                      <a
                        href={place.placeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "9px 12px",
                          borderRadius: "9px",
                          backgroundColor: "#ff6b35",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        카카오맵 보기
                      </a>

                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          style={{
                            padding: "9px 12px",
                            borderRadius: "9px",
                            backgroundColor: "#f1f3f5",
                            color: "#333333",
                            textDecoration: "none",
                            fontSize: "13px",
                          }}
                        >
                          전화
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default SearchPage;