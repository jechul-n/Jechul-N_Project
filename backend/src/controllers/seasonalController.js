const { getSeasonalItems } = require("../services/seasonalService");
const { getOptionalCategory, getOptionalMonth } = require("../utils/validation");

function getItems(request, response, next) {
  try {
    const month = getOptionalMonth(request.query.month);
    const category = getOptionalCategory(request.query.category);
    const items = getSeasonalItems({ month, category });

    response.json({
      success: true,
      month,
      category: category || "전체",
      items,
    });
  } catch (error) {
    next(error);
  }
}

function getCurrentItems(_request, response) {
  const month = new Date().getMonth() + 1;
  const items = getSeasonalItems({ month });

  response.json({
    success: true,
    month,
    category: "전체",
    items,
  });
}

module.exports = {
  getCurrentItems,
  getItems,
};
