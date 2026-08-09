import { Link } from "react-router-dom";

import type { SeasonalItem } from "../../types/seasonal";

interface SeasonalKeywordCardProps {
  item: SeasonalItem;
}

function SeasonalKeywordCard({ item }: SeasonalKeywordCardProps) {
  return (
    <Link
      className="seasonal-keyword-card"
      to={`/seasonal/${encodeURIComponent(item.keyword)}`}
    >
      <span className="seasonal-keyword-card__category">{item.category}</span>
      <strong className="seasonal-keyword-card__title">{item.keyword}</strong>
      <span className="seasonal-keyword-card__season">
        {item.availableMonths.map((month) => `${month}월`).join(", ")}
      </span>
    </Link>
  );
}

export default SeasonalKeywordCard;
