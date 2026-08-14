import { getSeasonalAsset } from "../../lib/seasonalAsset";

interface SeasonalVisualProps {
  keyword: string;
  className?: string;
}

function SeasonalVisual({ keyword, className }: SeasonalVisualProps) {
  const image = getSeasonalAsset(keyword);

  return image ? (
    <img className={className} src={image} alt="" />
  ) : (
    <span className={`${className || ""} seasonal-visual__fallback`} aria-hidden="true">
      {keyword.slice(0, 1)}
    </span>
  );
}

export default SeasonalVisual;
