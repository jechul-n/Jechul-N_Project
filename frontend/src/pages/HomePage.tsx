import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCurrentSeasonalItems } from "../api/seasonalApi";
import calendarPreviewImage from "../assets/figma/icon-home-calendar.svg";
import navigationIcon from "../assets/figma/icon-home-navigation.svg";
import searchIcon from "../assets/figma/icon-home-search.svg";
import mapPreviewImage from "../assets/figma/home-raw-8.png";
import MagazineCard from "../components/magazine/MagazineCard";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SeasonalCircleItem from "../components/seasonal/SeasonalCircleItem";
import { magazineItems } from "../data/magazineItems";
import { useRecentItems } from "../hooks/useRecentItems";
import { useSavedItems } from "../hooks/useSavedItems";
import type { SeasonalItem } from "../types/seasonal";

function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<SeasonalItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const { items: savedItems } = useSavedItems();
  const { items: recentItems } = useRecentItems();
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
            <img className="home-menu-card__map-image" src={mapPreviewImage} alt="" />
            <strong>제철 지도</strong>
            <img className="home-menu-card__navigation-icon" src={navigationIcon} alt="" />
          </Link>
          <Link className="home-menu-card home-menu-card--recommend" to="/recommend">
            <img className="home-menu-card__calendar-image" src={calendarPreviewImage} alt="" />
            <strong>제철 달력</strong>
          </Link>
          <Link className="home-menu-card home-menu-card--saved" to="/saved">
            <span>저장한<br />항목</span>
            {savedItems.length > 0 ? <strong className="home-menu-card__count">{savedItems.length}</strong> : null}
          </Link>
          <Link className="home-menu-card home-menu-card--recent" to="/recent">
            <span>최근 본<br />항목</span>
            {recentItems.length > 0 ? <strong className="home-menu-card__count">{recentItems.length}</strong> : null}
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
