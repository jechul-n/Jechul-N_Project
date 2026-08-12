import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCurrentSeasonalItems } from "../api/seasonalApi";
import calendarButtonImage from "../assets/figma/home-menu/calendar-button.png";
import mapButtonImage from "../assets/figma/home-menu/map-button.png";
import recentButtonImage from "../assets/figma/home-menu/recent-button.png";
import savedButtonImage from "../assets/figma/home-menu/saved-button.png";
import searchIcon from "../assets/figma/icon-home-search.svg";
import MagazineCard from "../components/magazine/MagazineCard";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SeasonalCircleItem from "../components/seasonal/SeasonalCircleItem";
import { magazineItems } from "../data/magazineItems";
import type { SeasonalItem } from "../types/seasonal";

function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<SeasonalItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const month = new Date().getMonth() + 1;

  const loadCurrentItems = () => {
    setIsLoadingItems(true);
    setItemsError("");

    getCurrentSeasonalItems()
      .then((data) => {
        setFeaturedItems(data.featured);
      })
      .catch(() => {
        setItemsError("이번 달 제철 추천을 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoadingItems(false);
      });
  };

  useEffect(() => {
    loadCurrentItems();
  }, []);

  return (
    <section className="page home-page">
      <header className="home-page__hero">
        <div>
          <h1 className="home-page__title">{month}월 제철 음식은...</h1>
          <p className="home-page__description">다양한 {month}월 제철 음식을 직접 경험하세요</p>
        </div>
        <Link className="home-page__search-link" to="/search" aria-label="제철 검색">
          <img src={searchIcon} alt="" />
        </Link>
      </header>

      <section className="home-page__seasonal" aria-labelledby="current-seasonal-heading">
        <div className="home-magazine__heading home-page__seasonal-heading">
          <h2 id="current-seasonal-heading">{month}월 제철 추천</h2>
          <Link to={`/search?month=${month}`}>더보기 &gt;</Link>
        </div>
        {isLoadingItems ? <LoadingState message="이번 달 제철 항목을 불러오는 중입니다." /> : null}
        {itemsError ? <ErrorState message={itemsError} onRetry={loadCurrentItems} /> : null}
        {!isLoadingItems && !itemsError ? (
          <div className="seasonal-circle-list">
            {featuredItems.map((item) => (
              <SeasonalCircleItem key={item.keyword} item={item} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="home-page__menu" aria-labelledby="main-menu-heading">
        <h2 id="main-menu-heading" className="screen-reader-only">주요 메뉴</h2>
        <div className="home-menu-grid">
          <Link className="home-menu-card home-menu-card--map" to="/map">
            <img className="home-menu-card__button-image" src={mapButtonImage} alt="제철 지도" />
          </Link>
          <Link className="home-menu-card home-menu-card--recommend" to="/recommend">
            <img className="home-menu-card__button-image" src={calendarButtonImage} alt="제철 달력" />
          </Link>
          <Link className="home-menu-card home-menu-card--saved" to="/saved">
            <img className="home-menu-card__button-image" src={savedButtonImage} alt="저장한 항목" />
          </Link>
          <Link className="home-menu-card home-menu-card--recent" to="/recent">
            <img className="home-menu-card__button-image" src={recentButtonImage} alt="최근 본 항목" />
          </Link>
        </div>
      </section>

      <section className="home-magazine" aria-labelledby="magazine-heading">
        <div className="home-magazine__heading">
          <h2 id="magazine-heading">제철 Magazine</h2>
          <span>더보기 ›</span>
        </div>
        <div className="home-magazine__list">
          {magazineItems.map((item) => (
            <MagazineCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
