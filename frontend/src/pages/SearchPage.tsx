import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getCurrentSeasonalItems, getSeasonalItems } from "../api/seasonalApi";
import BackButton from "../components/common/BackButton";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import FilterTabs from "../components/common/FilterTabs";
import LoadingState from "../components/common/LoadingState";
import SearchInput from "../components/common/SearchInput";
import SeasonalKeywordCard from "../components/seasonal/SeasonalKeywordCard";
import { useRecentSearches } from "../hooks/useRecentSearches";
import type { SeasonalCategoryFilter, SeasonalItem } from "../types/seasonal";

const MONTH_SEARCH_PATTERN = /^(1[0-2]|[1-9])월$/;

const categoryOptions = [
  { label: "전체", value: "전체" },
  { label: "과일", value: "과일" },
  { label: "해산물", value: "해산물" },
  { label: "채소", value: "채소" },
] as const;

function getMonthSearch(value: string): number | null {
  const matched = value.match(MONTH_SEARCH_PATTERN);

  return matched ? Number(matched[1]) : null;
}

function orderMonthlyItems(items: SeasonalItem[], featured: SeasonalItem[]): SeasonalItem[] {
  const itemsByKeyword = new Map(items.map((item) => [item.keyword, item]));
  const featuredItems = featured
    .map((item) => itemsByKeyword.get(item.keyword))
    .filter((item): item is SeasonalItem => Boolean(item));
  const featuredKeywords = new Set(featuredItems.map((item) => item.keyword));

  return [...featuredItems, ...items.filter((item) => !featuredKeywords.has(item.keyword))];
}

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthValue = Number(searchParams.get("month"));
  const month = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12
    ? monthValue
    : null;
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recommendedKeywords, setRecommendedKeywords] = useState<string[]>([]);
  const [monthItems, setMonthItems] = useState<SeasonalItem[]>([]);
  const [monthError, setMonthError] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [monthRequestVersion, setMonthRequestVersion] = useState(0);
  const [category, setCategory] = useState<SeasonalCategoryFilter>("전체");
  const { addSearch, clearSearches, recentSearches, removeSearch } =
    useRecentSearches();

  useEffect(() => {
    let isActive = true;

    getCurrentSeasonalItems()
      .then((data) => {
        if (isActive) {
          setRecommendedKeywords(data.featured.map((item) => item.keyword));
        }
      })
      .catch(() => {
        if (isActive) {
          setRecommendedKeywords([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!month) {
      setMonthItems([]);
      setMonthError("");
      setIsLoadingMonth(false);
      return;
    }

    let isActive = true;
    setKeyword(`${month}월`);
    setCategory("전체");
    setIsLoadingMonth(true);
    setMonthError("");

    getSeasonalItems({ month })
      .then((data) => {
        if (isActive) {
          setMonthItems(orderMonthlyItems(data.items, data.featured));
        }
      })
      .catch(() => {
        if (isActive) {
          setMonthError(`${month}월 제철 키워드를 불러오지 못했습니다.`);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingMonth(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [month, monthRequestVersion]);

  const filteredMonthItems = useMemo(
    () =>
      category === "전체"
        ? monthItems
        : monthItems.filter((item) => item.category === category),
    [category, monthItems]
  );

  const searchKeyword = (value: string) => {
    const trimmedKeyword = value.trim();

    if (!trimmedKeyword) {
      setErrorMessage("검색어를 입력해 주세요.");
      return;
    }

    addSearch(trimmedKeyword);
    setErrorMessage("");

    const searchedMonth = getMonthSearch(trimmedKeyword);
    if (searchedMonth) {
      navigate(`/search?month=${searchedMonth}`);
      return;
    }

    navigate(`/seasonal/${encodeURIComponent(trimmedKeyword)}`);
  };

  const retryMonthSearch = () => {
    setMonthRequestVersion((version) => version + 1);
  };

  return (
    <section className="page search-page">
      <div className="search-page__back-row">
        <BackButton />
      </div>
      <header className="page-heading">
        <h1>제철 검색</h1>
        <p>제철 과일, 해산물, 채소를 검색해 보세요.</p>
      </header>

      <SearchInput
        value={keyword}
        onChange={setKeyword}
        onSubmit={searchKeyword}
        placeholder="예: 8월, 딸기, 전어, 감자"
      />
      {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

      {month ? (
        <section className="page-section" aria-labelledby="monthly-search-heading">
          <div className="section-heading">
            <div>
              <h2 id="monthly-search-heading">{month}월 제철 키워드</h2>
              <p>대표 추천을 먼저 보여드립니다.</p>
            </div>
          </div>
          <FilterTabs
            ariaLabel={`${month}월 제철 키워드 카테고리`}
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          {isLoadingMonth ? <LoadingState message={`${month}월 제철 키워드를 불러오는 중입니다.`} /> : null}
          {monthError ? <ErrorState message={monthError} onRetry={retryMonthSearch} /> : null}
          {!isLoadingMonth && !monthError && filteredMonthItems.length === 0 ? (
            <EmptyState title={`${month}월 제철 키워드를 찾지 못했습니다.`} />
          ) : null}
          {!isLoadingMonth && !monthError && filteredMonthItems.length > 0 ? (
            <div className="card-grid">
              {filteredMonthItems.map((item) => (
                <SeasonalKeywordCard key={item.keyword} item={item} />
              ))}
            </div>
          ) : null}
        </section>
      ) : (
        <section className="page-section" aria-labelledby="recommended-search-heading">
          <div className="section-heading">
            <h2 id="recommended-search-heading">추천 검색어</h2>
          </div>
          <div className="keyword-list">
            {recommendedKeywords.map((recommendedKeyword) => (
              <button
                key={recommendedKeyword}
                className="keyword-chip"
                type="button"
                onClick={() => searchKeyword(recommendedKeyword)}
              >
                {recommendedKeyword}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="page-section" aria-labelledby="recent-search-heading">
        <div className="section-heading">
          <h2 id="recent-search-heading">최근 검색어</h2>
          {recentSearches.length > 0 ? (
            <button className="button button--text" type="button" onClick={clearSearches}>
              전체 삭제
            </button>
          ) : null}
        </div>
        {recentSearches.length === 0 ? (
          <p className="muted-text">최근 검색어가 없습니다.</p>
        ) : (
          <ul className="simple-list">
            {recentSearches.map((recentKeyword) => (
              <li key={recentKeyword} className="simple-list__item">
                <button
                  className="button button--text"
                  type="button"
                  onClick={() => searchKeyword(recentKeyword)}
                >
                  {recentKeyword}
                </button>
                <button
                  className="button button--text"
                  type="button"
                  aria-label={`${recentKeyword} 검색어 삭제`}
                  onClick={() => removeSearch(recentKeyword)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default SearchPage;
