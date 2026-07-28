const SEASONAL_CATEGORIES = ["과일", "채소", "수산물", "꽃"];

const SEASONAL_ITEMS = [
  { keyword: "딸기", category: "과일", season: "12월~5월", availableMonths: [12, 1, 2, 3, 4, 5] },
  { keyword: "참외", category: "과일", season: "5월~8월", availableMonths: [5, 6, 7, 8] },
  { keyword: "복숭아", category: "과일", season: "6월~8월", availableMonths: [6, 7, 8] },
  { keyword: "수박", category: "과일", season: "6월~8월", availableMonths: [6, 7, 8] },
  { keyword: "포도", category: "과일", season: "8월~10월", availableMonths: [8, 9, 10] },
  { keyword: "사과", category: "과일", season: "8월~11월", availableMonths: [8, 9, 10, 11] },
  { keyword: "귤", category: "과일", season: "11월~2월", availableMonths: [11, 12, 1, 2] },
  { keyword: "토마토", category: "채소", season: "6월~9월", availableMonths: [6, 7, 8, 9] },
  { keyword: "감자", category: "채소", season: "6월~8월", availableMonths: [6, 7, 8] },
  { keyword: "옥수수", category: "채소", season: "7월~9월", availableMonths: [7, 8, 9] },
  { keyword: "고구마", category: "채소", season: "8월~10월", availableMonths: [8, 9, 10] },
  { keyword: "배추", category: "채소", season: "11월~2월", availableMonths: [11, 12, 1, 2] },
  { keyword: "냉이", category: "채소", season: "2월~4월", availableMonths: [2, 3, 4] },
  { keyword: "도다리", category: "수산물", season: "3월~5월", availableMonths: [3, 4, 5] },
  { keyword: "장어", category: "수산물", season: "5월~8월", availableMonths: [5, 6, 7, 8] },
  { keyword: "전복", category: "수산물", season: "8월~10월", availableMonths: [8, 9, 10] },
  { keyword: "전어", category: "수산물", season: "8월~10월", availableMonths: [8, 9, 10] },
  { keyword: "굴", category: "수산물", season: "11월~2월", availableMonths: [11, 12, 1, 2] },
  { keyword: "대게", category: "수산물", season: "12월~4월", availableMonths: [12, 1, 2, 3, 4] },
  { keyword: "벚꽃", category: "꽃", season: "3월~4월", availableMonths: [3, 4] },
  { keyword: "장미", category: "꽃", season: "5월~6월", availableMonths: [5, 6] },
  { keyword: "수국", category: "꽃", season: "6월~7월", availableMonths: [6, 7] },
  { keyword: "해바라기", category: "꽃", season: "7월~8월", availableMonths: [7, 8] },
  { keyword: "코스모스", category: "꽃", season: "9월~10월", availableMonths: [9, 10] },
];

module.exports = {
  SEASONAL_CATEGORIES,
  SEASONAL_ITEMS,
};
