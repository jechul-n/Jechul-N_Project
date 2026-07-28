const { AppError } = require("../utils/errors");

const QUERY_TEMPLATES = {
  과일: ["{keyword} 카페", "{keyword} 디저트", "{keyword} 전문점"],
  채소: ["{keyword} 요리", "{keyword} 전문점", "{keyword} 직거래"],
  수산물: ["{keyword} 맛집", "{keyword} 전문점", "{keyword} 시장"],
  꽃: ["{keyword} 명소", "{keyword} 식물원", "{keyword} 공원", "{keyword} 축제"],
};

function ensureKakaoApiKey() {
  if (!process.env.KAKAO_REST_API_KEY) {
    throw new AppError("서버에 카카오 REST API 키가 없습니다.", 500);
  }
}

function createPlaceQueries(keyword, category) {
  const templates = QUERY_TEMPLATES[category] || [
    "{keyword} 전문점",
    "{keyword} 관련 장소",
  ];

  return templates.map((template) => template.replace("{keyword}", keyword));
}

async function searchKakaoPlaces({ query, latitude, longitude, size = 5 }) {
  const params = new URLSearchParams({
    query,
    x: String(longitude),
    y: String(latitude),
    radius: "10000",
    sort: "distance",
    size: String(size),
  });
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`카카오 장소 검색에 실패했습니다. (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data.documents) ? data.documents : [];
}

function normalizePlace(place) {
  return {
    id: String(place.id),
    name: place.place_name || "이름 정보 없음",
    category: place.category_name || "기타",
    address: place.road_address_name || place.address_name || "",
    phone: place.phone || "",
    distance: Number(place.distance || 0),
    latitude: Number(place.y),
    longitude: Number(place.x),
    placeUrl: place.place_url || "",
  };
}

function removeDuplicatePlaces(places) {
  const placeMap = new Map();

  for (const place of places) {
    if (!placeMap.has(place.id)) {
      placeMap.set(place.id, place);
    }
  }

  return [...placeMap.values()];
}

async function searchRelatedPlaces({
  keyword,
  category,
  latitude,
  longitude,
  limit = 10,
  size = 5,
}) {
  ensureKakaoApiKey();

  const queries = createPlaceQueries(keyword, category);
  const results = await Promise.allSettled(
    queries.map((query) =>
      searchKakaoPlaces({ query, latitude, longitude, size })
    )
  );
  const fulfilledResults = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  if (fulfilledResults.length === 0) {
    const failedResult = results.find((result) => result.status === "rejected");
    throw failedResult?.reason || new Error("카카오 장소 검색에 실패했습니다.");
  }

  return removeDuplicatePlaces(fulfilledResults.map(normalizePlace))
    .sort((firstPlace, secondPlace) => firstPlace.distance - secondPlace.distance)
    .slice(0, limit);
}

module.exports = {
  ensureKakaoApiKey,
  removeDuplicatePlaces,
  searchRelatedPlaces,
};
