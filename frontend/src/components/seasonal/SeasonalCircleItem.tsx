import { Link } from "react-router-dom";

import type { SeasonalItem } from "../../types/seasonal";
import SeasonalVisual from "./SeasonalVisual";

interface SeasonalCircleItemProps {
  item: SeasonalItem;
  showLabel?: boolean;
}

function SeasonalCircleItem({ item, showLabel = false }: SeasonalCircleItemProps) {
  return (
    <Link
      className={showLabel ? "seasonal-circle-item seasonal-circle-item--with-label" : "seasonal-circle-item"}
      to={`/seasonal/${encodeURIComponent(item.keyword)}`}
      aria-label={`${item.keyword} 제철 정보 보기`}
    >
      <span className="seasonal-circle-item__image-wrap" aria-hidden="true">
        <SeasonalVisual keyword={item.keyword} className="seasonal-circle-item__image" />
      </span>
      {showLabel ? (
        <span className="seasonal-circle-item__label">{item.keyword}</span>
      ) : (
        <span className="screen-reader-only">{item.keyword}</span>
      )}
    </Link>
  );
}

export default SeasonalCircleItem;
