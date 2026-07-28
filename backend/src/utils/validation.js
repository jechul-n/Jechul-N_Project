const { SEASONAL_CATEGORIES } = require("../data/seasonalItems");
const { AppError } = require("./errors");

function getRequiredKeyword(value) {
  const keyword = String(value || "").trim();

  if (!keyword) {
    throw new AppError("검색어를 입력해 주세요.", 400);
  }

  if (keyword.length > 50) {
    throw new AppError("검색어는 50자 이하로 입력해 주세요.", 400);
  }

  return keyword;
}

function getCoordinates(latitudeValue, longitudeValue) {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new AppError("현재 위치 정보가 올바르지 않습니다.", 400);
  }

  return { latitude, longitude };
}

function getOptionalMonth(value, defaultMonth = new Date().getMonth() + 1) {
  if (value === undefined || value === "") {
    return defaultMonth;
  }

  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError("월 정보는 1부터 12 사이여야 합니다.", 400);
  }

  return month;
}

function getOptionalCategory(value) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const category = String(value).trim();

  if (!SEASONAL_CATEGORIES.includes(category)) {
    throw new AppError("지원하지 않는 카테고리입니다.", 400);
  }

  return category;
}

module.exports = {
  getCoordinates,
  getOptionalCategory,
  getOptionalMonth,
  getRequiredKeyword,
};
