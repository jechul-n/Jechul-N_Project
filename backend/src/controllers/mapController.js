const { searchSeasonalMapPlaces } = require("../services/kakaoService");
const {
  getFeaturedSeasonalItems,
} = require("../services/seasonalService");
const {
  getCoordinates,
  getOptionalCategory,
  getOptionalMonth,
} = require("../utils/validation");

const MAX_FEATURED_KEYWORDS = 5;
const MAX_PLACES_PER_SEARCH_QUERY = 3;
const MAX_MAP_PLACES = 20;

function getMapFeaturedItems({ month, category }) {
  const featuredItems = getFeaturedSeasonalItems({
    month,
    limit: MAX_FEATURED_KEYWORDS,
  });

  return featuredItems.filter(
    (item) => item.mapEnabled && (!category || item.category === category)
  );
}

async function getMapPlaces(request, response, next) {
  try {
    const { latitude, longitude } = getCoordinates(
      request.query.latitude,
      request.query.longitude
    );
    const month = getOptionalMonth(request.query.month);
    const category = getOptionalCategory(request.query.category);
    const seasonalItems = getMapFeaturedItems({ month, category });
    const places = await searchSeasonalMapPlaces({
      items: seasonalItems,
      latitude,
      longitude,
      limit: MAX_MAP_PLACES,
      size: MAX_PLACES_PER_SEARCH_QUERY,
    });

    response.json({
      success: true,
      month,
      category: category || "전체",
      featured: seasonalItems,
      keywords: seasonalItems.map((item) => item.keyword),
      places,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  MAX_FEATURED_KEYWORDS,
  MAX_MAP_PLACES,
  MAX_PLACES_PER_SEARCH_QUERY,
  getMapFeaturedItems,
  getMapPlaces,
};
