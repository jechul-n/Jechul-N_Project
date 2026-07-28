const { SEASONAL_ITEMS } = require("../data/seasonalItems");

function getSeasonalItems({ month, category }) {
  return SEASONAL_ITEMS.filter(
    (item) =>
      item.availableMonths.includes(month) &&
      (!category || item.category === category)
  );
}

function findSeasonalItem(keyword) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();

  return SEASONAL_ITEMS.find(
    (item) => item.keyword.toLocaleLowerCase() === normalizedKeyword
  );
}

function createFallbackSeasonalInfo(keyword, seasonalItem) {
  const category = seasonalItem?.category || "과일";
  const season = seasonalItem?.season || "제철 시기 정보 확인 필요";

  return {
    category,
    season,
    description: `${keyword}의 제철 정보를 불러오지 못했습니다. 지역과 품종에 따라 제철 시기는 달라질 수 있습니다.`,
    benefits: [],
    relatedFoods: [],
  };
}

module.exports = {
  createFallbackSeasonalInfo,
  findSeasonalItem,
  getSeasonalItems,
};
