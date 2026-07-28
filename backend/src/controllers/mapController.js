const { searchRelatedPlaces, removeDuplicatePlaces } = require("../services/kakaoService");
const { getSeasonalItems } = require("../services/seasonalService");
const {
  getCoordinates,
  getOptionalCategory,
  getOptionalMonth,
} = require("../utils/validation");

const MAX_MAP_KEYWORDS = 4;
const MAX_MAP_PLACES = 20;

async function getMapPlaces(request, response, next) {
  try {
    const { latitude, longitude } = getCoordinates(
      request.query.latitude,
      request.query.longitude
    );
    const month = getOptionalMonth(request.query.month);
    const category = getOptionalCategory(request.query.category);
    const seasonalItems = getSeasonalItems({ month, category }).slice(
      0,
      MAX_MAP_KEYWORDS
    );
    const results = await Promise.allSettled(
      seasonalItems.map((item) =>
        searchRelatedPlaces({
          keyword: item.keyword,
          category: item.category,
          latitude,
          longitude,
          limit: 5,
          size: 3,
        })
      )
    );
    const places = removeDuplicatePlaces(
      results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
    )
      .sort((firstPlace, secondPlace) => firstPlace.distance - secondPlace.distance)
      .slice(0, MAX_MAP_PLACES);

    response.json({
      success: true,
      month,
      category: category || "전체",
      keywords: seasonalItems.map((item) => item.keyword),
      places,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMapPlaces,
};
