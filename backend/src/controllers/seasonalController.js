const {
  getFeaturedSeasonalItems,
  getSeasonalItems,
} = require("../services/seasonalService");
const { getOptionalCategory, getOptionalMonth } = require("../utils/validation");

function getItems(request, response, next) {
  try {
    const month = getOptionalMonth(request.query.month);
    const category = getOptionalCategory(request.query.category);
    const items = getSeasonalItems({ month, category });
    const featured = getFeaturedSeasonalItems({ month });

    response.json({
      success: true,
      month,
      category: category || "전체",
      items,
      featured,
    });
  } catch (error) {
    next(error);
  }
}

function getCurrentItems(_request, response) {
  const month = new Date().getMonth() + 1;
  const items = getSeasonalItems({ month });
  const featured = getFeaturedSeasonalItems({ month });

  response.json({
    success: true,
    month,
    category: "전체",
    items,
    featured,
  });
}

module.exports = {
  getCurrentItems,
  getItems,
};
