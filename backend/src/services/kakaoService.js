const { AppError } = require("../utils/errors");

const RELATED_PLACE_QUERY_TEMPLATES = {
  과일: ["{keyword} 카페", "{keyword} 디저트", "{keyword} 전문점"],
  채소: ["{keyword} 요리", "{keyword} 전문점", "{keyword} 직거래"],
  해산물: ["{keyword} 맛집", "{keyword} 전문점", "{keyword} 시장"],
};

const FALLBACK_PLACE_SEARCH_QUERY_TEMPLATES = {
  과일: ["{keyword} 카페", "{keyword} 디저트", "{keyword} 케이크", "{keyword} 농장"],
  채소: ["{keyword} 맛집", "{keyword} 한식", "{keyword} 카페"],
  해산물: ["{keyword} 맛집", "{keyword} 전문점", "{keyword} 시장"],
};

const FRUIT_DERIVED_SEARCH_QUERY_TEMPLATES = ["{keyword} 주스", "{keyword} 디저트"];

function ensureKakaoApiKey() {
  if (!process.env.KAKAO_REST_API_KEY) {
    throw new AppError("서버에 카카오 REST API 키가 없습니다.", 500);
  }
}

function buildPlaceSearchQueries(item) {
  const databaseQueries = (item.searchQueries || [])
    .map((query) => String(query || "").trim())
    .filter(Boolean);

  const derivedQueries =
    item.category === "과일"
      ? FRUIT_DERIVED_SEARCH_QUERY_TEMPLATES.map((template) =>
          template.replace("{keyword}", item.keyword)
        )
      : [];

  if (databaseQueries.length > 0) {
    return [...new Set([...databaseQueries, ...derivedQueries])];
  }

  const templates = FALLBACK_PLACE_SEARCH_QUERY_TEMPLATES[item.category] || [
    "{keyword} 전문점",
    "{keyword} 관련 장소",
  ];

  return [
    ...new Set([
      ...templates.map((template) => template.replace("{keyword}", item.keyword)),
      ...derivedQueries,
    ]),
  ];
}

function createRelatedPlaceQueries(keyword, category) {
  const templates = RELATED_PLACE_QUERY_TEMPLATES[category] || [
    "{keyword} 전문점",
    "{keyword} 관련 장소",
  ];

  return templates.map((template) => template.replace("{keyword}", keyword));
}

function buildMapSearchQueryGroups(items) {
  const groupedQueries = new Map();

  for (const item of items) {
    for (const query of buildPlaceSearchQueries(item)) {
      const relatedKeywords = groupedQueries.get(query) || new Set();
      relatedKeywords.add(item.keyword);
      groupedQueries.set(query, relatedKeywords);
    }
  }

  return [...groupedQueries.entries()].map(([query, relatedKeywords]) => ({
    query,
    relatedKeywords: [...relatedKeywords],
  }));
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

function normalizePlace(place, relatedKeyword) {
  const relatedKeywords = [
    ...new Set(
      (Array.isArray(relatedKeyword) ? relatedKeyword : [relatedKeyword]).filter(Boolean)
    ),
  ];

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
    relatedKeyword: relatedKeywords[0] || "",
    relatedKeywords,
  };
}

function getRelatedKeywords(place) {
  return [...new Set([
    ...(Array.isArray(place.relatedKeywords) ? place.relatedKeywords : []),
    place.relatedKeyword,
  ].filter(Boolean))];
}

function isRestaurantPlace(place) {
  return String(place.category_name || "").includes("음식점");
}

function removeDuplicatePlaces(places) {
  const placeMap = new Map();

  for (const place of places) {
    const existingPlace = placeMap.get(place.id);

    if (!existingPlace) {
      const relatedKeywords = getRelatedKeywords(place);
      placeMap.set(place.id, {
        ...place,
        relatedKeyword: relatedKeywords[0] || "",
        relatedKeywords,
      });
      continue;
    }

    const relatedKeywords = [...new Set([
      ...getRelatedKeywords(existingPlace),
      ...getRelatedKeywords(place),
    ])];
    placeMap.set(place.id, {
      ...existingPlace,
      relatedKeyword: relatedKeywords[0] || "",
      relatedKeywords,
    });
  }

  return [...placeMap.values()];
}

async function searchPlaces({
  keyword,
  latitude,
  longitude,
  queries,
  placeFilter = () => true,
  limit = 10,
  size = 5,
}) {
  ensureKakaoApiKey();

  const results = await Promise.allSettled(
    queries.map((query) =>
      searchKakaoPlaces({ query, latitude, longitude, size })
    )
  );
  const successfulResults = results.filter((result) => result.status === "fulfilled");
  const fulfilledResults = successfulResults.flatMap((result) => result.value);

  if (successfulResults.length === 0) {
    const failedResult = results.find((result) => result.status === "rejected");
    throw failedResult?.reason || new Error("카카오 장소 검색에 실패했습니다.");
  }

  return removeDuplicatePlaces(
    fulfilledResults.filter(placeFilter).map((place) => normalizePlace(place, keyword))
  )
    .sort((firstPlace, secondPlace) => firstPlace.distance - secondPlace.distance)
    .slice(0, limit);
}

function searchRelatedPlaces({ keyword, category, ...options }) {
  return searchPlaces({
    keyword,
    queries: createRelatedPlaceQueries(keyword, category),
    placeFilter: isRestaurantPlace,
    ...options,
  });
}

async function searchSeasonalMapPlaces({
  items,
  latitude,
  longitude,
  limit = 20,
  size = 3,
}) {
  if (items.length === 0) {
    return [];
  }

  ensureKakaoApiKey();

  const queryGroups = buildMapSearchQueryGroups(items);
  const results = await Promise.allSettled(
    queryGroups.map(({ query }) => searchKakaoPlaces({ query, latitude, longitude, size }))
  );
  const successfulResults = results
    .map((result, index) => ({ result, queryGroup: queryGroups[index] }))
    .filter(({ result }) => result.status === "fulfilled");

  if (successfulResults.length === 0) {
    const failedResult = results.find((result) => result.status === "rejected");
    throw failedResult?.reason || new Error("카카오 장소 검색에 실패했습니다.");
  }

  return removeDuplicatePlaces(
    successfulResults.flatMap(({ result, queryGroup }) =>
      result.value.map((place) => normalizePlace(place, queryGroup.relatedKeywords))
    )
  )
    .sort((firstPlace, secondPlace) => firstPlace.distance - secondPlace.distance)
    .slice(0, limit);
}

module.exports = {
  buildMapSearchQueryGroups,
  buildPlaceSearchQueries,
  ensureKakaoApiKey,
  removeDuplicatePlaces,
  searchRelatedPlaces,
  searchSeasonalMapPlaces,
};
