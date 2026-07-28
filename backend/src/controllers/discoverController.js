const { createSeasonalInfo } = require("../services/geminiService");
const { ensureKakaoApiKey, searchRelatedPlaces } = require("../services/kakaoService");
const {
  createFallbackSeasonalInfo,
  findSeasonalItem,
} = require("../services/seasonalService");
const { getCoordinates, getRequiredKeyword } = require("../utils/validation");

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "알 수 없는 오류";
}

async function discover(request, response, next) {
  try {
    const keyword = getRequiredKeyword(request.query.keyword);
    const { latitude, longitude } = getCoordinates(
      request.query.latitude,
      request.query.longitude
    );
    const seasonalItem = findSeasonalItem(keyword);
    const fallbackInfo = createFallbackSeasonalInfo(keyword, seasonalItem);

    ensureKakaoApiKey();

    const [seasonalInfoResult, placesResult] = await Promise.allSettled([
      createSeasonalInfo(keyword, seasonalItem),
      searchRelatedPlaces({
        keyword,
        category: seasonalItem?.category,
        latitude,
        longitude,
      }),
    ]);

    const seasonalInfo =
      seasonalInfoResult.status === "fulfilled"
        ? seasonalInfoResult.value
        : fallbackInfo;
    const placeSearchFailed = placesResult.status === "rejected";
    const places =
      placesResult.status === "fulfilled" ? placesResult.value : [];

    if (seasonalInfoResult.status === "rejected") {
      console.error(
        "Gemini 제철 정보 생성 실패:",
        getErrorMessage(seasonalInfoResult.reason)
      );
    }

    if (placeSearchFailed) {
      console.error(
        "Kakao 장소 검색 실패:",
        getErrorMessage(placesResult.reason)
      );
    }

    response.json({
      success: true,
      keyword,
      description: seasonalInfo.description,
      seasonalInfo,
      places,
      placeSearchFailed,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  discover,
};
