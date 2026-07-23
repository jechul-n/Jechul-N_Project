const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("제철엔 백엔드 서버 실행 중");
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "백엔드 서버가 정상적으로 작동합니다.",
  });
});

async function createAiDescription(keyword) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
한국의 제철 정보 서비스에 사용할 설명을 작성해줘.

검색어: ${keyword}

다음 내용을 포함해 한국어로 3~4문장으로 작성해줘.
- 무엇인지
- 대표적인 제철 시기
- 맛이나 특징
- 즐기는 방법

지역과 품종에 따라 제철 시기가 다를 수 있다면 짧게 밝혀줘.
제목이나 번호 없이 설명문만 출력해줘.
            `.trim(),
          },
        ],
      },
    ],
  });

  const description = response.text?.trim();

  if (!description) {
    console.log("Gemini 원본 응답:", JSON.stringify(response, null, 2));
    throw new Error("Gemini 응답에 텍스트가 없습니다.");
  }

  return description;
}

async function searchKakaoPlaces({
  query,
  latitude,
  longitude,
  radius = 10000,
}) {
  const params = new URLSearchParams({
    query,
    x: String(longitude),
    y: String(latitude),
    radius: String(radius),
    sort: "distance",
    size: "15",
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
    const errorText = await response.text();

    console.error(
      "카카오 장소 검색 실패:",
      response.status,
      errorText
    );

    throw new Error("주변 장소 검색에 실패했습니다.");
  }

  const data = await response.json();

  return data.documents;
}

function createPlaceQueries(keyword) {
  return [
    `${keyword} 맛집`,
    `${keyword} 카페`,
    `${keyword} 디저트`,
    `${keyword} 전문점`,
  ];
}

function removeDuplicatePlaces(places) {
  const placeMap = new Map();

  for (const place of places) {
    if (!placeMap.has(place.id)) {
      placeMap.set(place.id, place);
    }
  }

  return [...placeMap.values()];
}

app.get("/api/discover", async (req, res) => {
  try {
    const keyword = String(req.query.keyword || "").trim();
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "검색어를 입력해 주세요.",
      });
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "현재 위치 정보가 올바르지 않습니다.",
      });
    }

    if (!process.env.KAKAO_REST_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "서버에 카카오 REST API 키가 없습니다.",
      });
    }

    const placeQueries = createPlaceQueries(keyword);

    const [descriptionResult, placeResults] =
      await Promise.allSettled([
        createAiDescription(keyword),

        Promise.all(
          placeQueries.map((query) =>
            searchKakaoPlaces({
              query,
              latitude,
              longitude,
            })
          )
        ),
      ]);

    let description;

    if (descriptionResult.status === "fulfilled") {
      description = descriptionResult.value;
    } else {
      console.error("Gemini 설명 생성 실패:");
      console.error(descriptionResult.reason);


      description = `${keyword}에 대한 설명을 불러오지 못했습니다.`;
    }

    let places = [];

    if (placeResults.status === "fulfilled") {
      places = removeDuplicatePlaces(placeResults.value.flat())
        .sort(
          (a, b) =>
            Number(a.distance || 0) -
            Number(b.distance || 0)
        )
        .slice(0, 10)
        .map((place) => ({
          id: place.id,
          name: place.place_name,
          category: place.category_name,
          address:
            place.road_address_name || place.address_name,
          phone: place.phone,
          distance: Number(place.distance || 0),
          latitude: Number(place.y),
          longitude: Number(place.x),
          placeUrl: place.place_url,
        }));
    } else {
      console.error(
        "카카오 장소 검색 실패:",
        placeResults.reason
      );
    }

    return res.json({
      success: true,
      keyword,
      description,
      places,
    });
  } catch (error) {
    console.error("제철 검색 오류:", error);

    return res.status(500).json({
      success: false,
      message:
        "검색 결과를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `서버 실행 중: http://localhost:${PORT}`
  );
});