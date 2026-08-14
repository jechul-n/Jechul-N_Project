import abaloneImage from "../assets/seasonal/abalone.png";
import cornImage from "../assets/seasonal/corn.png";
import fishImage from "../assets/seasonal/fish.png";
import oysterImage from "../assets/seasonal/oyster.png";
import peachImage from "../assets/seasonal/peach.png";
import shrimpImage from "../assets/seasonal/shrimp.png";
import watermelonImage from "../assets/seasonal/watermelon.png";
import cornHomeImage from "../assets/figma/home-seasonal/corn-button.png";
import oysterHomeImage from "../assets/figma/home-seasonal/oyster-button.png";
import peachHomeImage from "../assets/figma/home-seasonal/peach-button.png";
import tomatoHomeImage from "../assets/figma/home-seasonal/tomato-button.png";
import watermelonHomeImage from "../assets/figma/home-seasonal/watermelon-button.png";

const seasonalAssetRules = [
  { keywords: ["굴"], image: oysterImage },
  { keywords: ["옥수수"], image: cornImage },
  { keywords: ["복숭아"], image: peachImage },
  { keywords: ["수박"], image: watermelonImage },
  { keywords: ["전복"], image: abaloneImage },
  { keywords: ["대하", "생새우"], image: shrimpImage },
  { keywords: ["갈치", "고등어", "광어", "민어", "전어", "도미"], image: fishImage },
] as const;

/** Returns a matching project seasonal image for a seasonal keyword or phrase. */
export function getSeasonalAsset(keyword?: string): string | undefined {
  const normalizedKeyword = keyword?.trim();

  if (!normalizedKeyword) {
    return undefined;
  }

  return seasonalAssetRules.find(({ keywords }) =>
    keywords.some((candidate) => normalizedKeyword.includes(candidate))
  )?.image;
}

const homeSeasonalAssetRules = [
  { keywords: ["굴"], image: oysterHomeImage },
  { keywords: ["전복"], image: abaloneImage },
  { keywords: ["옥수수"], image: cornHomeImage },
  { keywords: ["복숭아"], image: peachHomeImage },
  { keywords: ["수박"], image: watermelonHomeImage },
  { keywords: ["토마토"], image: tomatoHomeImage },
  { keywords: ["대하", "생새우"], image: shrimpImage },
  { keywords: ["갈치", "고등어", "광어", "민어", "전어", "도미"], image: fishImage },
] as const;

/** Figma home-screen seasonal button artwork for map markers. */
export function getHomeSeasonalAsset(keyword?: string): string | undefined {
  const normalizedKeyword = keyword?.trim();

  if (!normalizedKeyword) {
    return undefined;
  }

  return homeSeasonalAssetRules.find(({ keywords }) =>
    keywords.some((candidate) => normalizedKeyword.includes(candidate))
  )?.image;
}
