import cornImage from "../../assets/seasonal/corn.png";
import oysterImage from "../../assets/seasonal/oyster.png";
import peachImage from "../../assets/seasonal/peach.png";
import watermelonImage from "../../assets/seasonal/watermelon.png";

const seasonalImageByKeyword: Record<string, string> = {
  굴: oysterImage,
  옥수수: cornImage,
  복숭아: peachImage,
  수박: watermelonImage,
};

interface SeasonalVisualProps {
  keyword: string;
  className?: string;
}

function SeasonalVisual({ keyword, className }: SeasonalVisualProps) {
  const image = seasonalImageByKeyword[keyword];

  return image ? (
    <img className={className} src={image} alt="" />
  ) : (
    <span className={`${className || ""} seasonal-visual__fallback`} aria-hidden="true">
      {keyword.slice(0, 1)}
    </span>
  );
}

export default SeasonalVisual;
