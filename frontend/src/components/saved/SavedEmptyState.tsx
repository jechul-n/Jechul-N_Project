import { Link } from "react-router-dom";

import mapIcon from "../../assets/figma/icon-saved-map.svg";
import searchIcon from "../../assets/figma/icon-saved-search.svg";
import savedBagImage from "../../assets/saved-bag.png";

interface SavedEmptyStateProps {
  title?: string;
  description?: string;
}

function SavedEmptyState({
  title = "아직 저장한 항목이 없어요",
  description = "마음에 드는 제철 정보나 장소를 저장하면\n여기에서 쉽게 확인할 수 있어요.",
}: SavedEmptyStateProps) {
  return (
    <section className="saved-empty-state" aria-labelledby="saved-empty-title">
      <h2 id="saved-empty-title" className="saved-empty-state__title">
        {title}
      </h2>
      <img className="saved-empty-state__image" src={savedBagImage} alt="" />
      <p className="saved-empty-state__description">{description}</p>
      <div className="saved-empty-state__actions">
        <Link className="saved-empty-state__button saved-empty-state__button--primary" to="/map">
          <img src={mapIcon} alt="" />
          제철 지도 둘러보기
        </Link>
        <Link className="saved-empty-state__button saved-empty-state__button--secondary" to="/search">
          <img src={searchIcon} alt="" />
          제철 정보 찾아보기
        </Link>
      </div>
    </section>
  );
}

export default SavedEmptyState;
