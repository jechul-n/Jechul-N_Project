const {
  MONTHLY_FEATURED,
  SEASONAL_ITEMS,
} = require("../data/seasonalItems");

const DEFAULT_FEATURED_KEYWORD_COUNT = 5;
const MAX_FEATURED_KEYWORDS = 5;

function getSeasonalItems({ month, category }) {
  return SEASONAL_ITEMS.filter(
    (item) =>
      item.availableMonths.includes(month) &&
      (!category || item.category === category)
  );
}

function getFeaturedSeasonalItems({
  month,
  limit = DEFAULT_FEATURED_KEYWORD_COUNT,
}) {
  const itemsByKeyword = new Map(
    getSeasonalItems({ month }).map((item) => [item.keyword, item])
  );
  const maximum = Math.min(Math.max(limit, 1), MAX_FEATURED_KEYWORDS);
  const monthlyItems = (MONTHLY_FEATURED[month] || [])
    .map((keyword) => itemsByKeyword.get(keyword))
    .filter(Boolean);

  if (monthlyItems.length > 0) {
    return monthlyItems.slice(0, maximum);
  }

  return getSeasonalItems({ month })
    .filter((item) => item.featured)
    .slice(0, maximum);
}

function findSeasonalItem(keyword) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();

  return SEASONAL_ITEMS.find(
    (item) => item.keyword.toLocaleLowerCase() === normalizedKeyword
  );
}

function createFallbackSeasonalInfo(keyword, seasonalItem) {
  const category = seasonalItem?.category || "과일";
  const season = seasonalItem?.availableMonths?.length
    ? seasonalItem.availableMonths.map((month) => `${month}월`).join(", ")
    : "제철 시기 정보 확인 필요";

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
  getFeaturedSeasonalItems,
  getSeasonalItems,
};
