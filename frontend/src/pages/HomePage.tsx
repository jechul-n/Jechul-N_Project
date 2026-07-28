import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getHealth } from "../api/healthApi";
import { getCurrentSeasonalItems } from "../api/seasonalApi";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SearchInput from "../components/common/SearchInput";
import SeasonalKeywordCard from "../components/seasonal/SeasonalKeywordCard";
import type { SeasonalItem } from "../types/seasonal";

const menus = [
  {
    title: "제철 지도",
    description: "내 주변의 제철 장소를 지도에서 확인해요.",
    path: "/map",
  },
  {
    title: "저장한 항목",
    description: "저장한 제철 키워드와 장소를 확인해요.",
    path: "/saved",
  },
  {
    title: "최근 본 항목",
    description: "최근에 확인한 키워드와 장소를 다시 봐요.",
    path: "/recent",
  },
  {
    title: "로그인",
    description: "로그인과 회원가입 페이지로 이동해요.",
    path: "/login",
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [serverMessage, setServerMessage] = useState("서버 확인 중");
  const [items, setItems] = useState<SeasonalItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    let isActive = true;

    getHealth()
      .then((data) => {
        if (isActive) {
          setServerMessage(data.message);
        }
      })
      .catch(() => {
        if (isActive) {
          setServerMessage("백엔드 연결 실패");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const loadCurrentItems = () => {
    setIsLoadingItems(true);
    setItemsError("");

    getCurrentSeasonalItems()
      .then((data) => {
        setItems(data.items);
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

  const handleSearch = (searchKeyword: string) => {
    if (!searchKeyword) {
      return;
    }

    navigate(`/seasonal/${encodeURIComponent(searchKeyword)}`);
  };

  return (
    <section className="page home-page">
      <header className="home-page__hero">
        <p className="home-page__eyebrow">지금이 가장 맛있는 순간</p>
        <h1 className="home-page__title">제철엔</h1>
        <p className="home-page__description">
          계절에 맞는 음식, 꽃, 축제와 주변 장소를 찾아보세요.
        </p>
      </header>

      <SearchInput
        value={keyword}
        onChange={setKeyword}
        onSubmit={handleSearch}
        placeholder="예: 딸기, 전어, 수국"
      />

      <p
        className={
          serverMessage === "백엔드 연결 실패"
            ? "server-status server-status--error"
            : "server-status"
        }
      >
        서버 상태: {serverMessage}
      </p>

      <section className="page-section" aria-labelledby="current-seasonal-heading">
        <div className="section-heading">
          <div>
            <h2 id="current-seasonal-heading">이번 달 제철 추천</h2>
            <p>현재 달에 어울리는 제철 항목입니다.</p>
          </div>
          <Link className="button button--text" to="/recommend">
            전체 보기
          </Link>
        </div>

        {isLoadingItems ? <LoadingState message="이번 달 제철 항목을 불러오는 중입니다." /> : null}
        {itemsError ? <ErrorState message={itemsError} onRetry={loadCurrentItems} /> : null}
        {!isLoadingItems && !itemsError ? (
          <div className="card-grid">
            {items.slice(0, 4).map((item) => (
              <SeasonalKeywordCard key={item.keyword} item={item} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="page-section" aria-labelledby="main-menu-heading">
        <div className="section-heading">
          <h2 id="main-menu-heading">주요 메뉴</h2>
        </div>
        <div className="home-menu-grid">
          {menus.map((menu) => (
            <Link key={menu.path} className="home-menu-card" to={menu.path}>
              <strong>{menu.title}</strong>
              <span>{menu.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
