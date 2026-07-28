const { GoogleGenAI, Type } = require("@google/genai");

const { createFallbackSeasonalInfo } = require("./seasonalService");

let client;

const seasonalInfoSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "과일, 채소, 수산물, 꽃 중 하나",
    },
    season: {
      type: Type.STRING,
      description: "대표적인 제철 기간",
    },
    description: {
      type: Type.STRING,
      description: "한국어 2~3문장 설명",
    },
    benefits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "맛 또는 특징 목록",
    },
    relatedFoods: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "관련 음식 또는 즐기는 방법 목록",
    },
  },
  required: ["category", "season", "description", "benefits", "relatedFoods"],
};

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
}

function removeCodeFence(value) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function toStringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
}

function parseSeasonalInfo(rawText, keyword, fallbackInfo) {
  const parsed = JSON.parse(removeCodeFence(rawText));
  const category = toStringValue(parsed?.category, fallbackInfo.category);
  const validCategory = ["과일", "채소", "수산물", "꽃"].includes(category)
    ? category
    : fallbackInfo.category;

  return {
    category: validCategory,
    season: toStringValue(parsed?.season, fallbackInfo.season),
    description: toStringValue(parsed?.description, fallbackInfo.description),
    benefits: toStringArray(parsed?.benefits),
    relatedFoods: toStringArray(parsed?.relatedFoods),
  };
}

async function createSeasonalInfo(keyword, seasonalItem) {
  const fallbackInfo = createFallbackSeasonalInfo(keyword, seasonalItem);
  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: `한국의 제철 정보 서비스에 사용할 정보를 작성해 주세요.\n\n검색어: ${keyword}\n\n반드시 한국어 JSON만 반환하세요. category는 과일, 채소, 수산물, 꽃 중 하나여야 하며, 계절이나 특징이 확실하지 않다면 추측하지 말고 보수적으로 작성하세요.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: seasonalInfoSchema,
      temperature: 0.4,
    },
  });

  if (!response.text?.trim()) {
    throw new Error("Gemini 응답에 텍스트가 없습니다.");
  }

  return parseSeasonalInfo(response.text, keyword, fallbackInfo);
}

module.exports = {
  createSeasonalInfo,
};
