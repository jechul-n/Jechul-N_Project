import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/common/BackButton";
import SearchInput from "../components/common/SearchInput";
import { RECOMMENDED_SEARCH_KEYWORDS } from "../data/recommendedKeywords";
import { useRecentSearches } from "../hooks/useRecentSearches";

function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { addSearch, clearSearches, recentSearches, removeSearch } =
    useRecentSearches();

  const searchKeyword = (value: string) => {
    const trimmedKeyword = value.trim();

    if (!trimmedKeyword) {
      setErrorMessage("검색어를 입력해 주세요.");
      return;
    }

    addSearch(trimmedKeyword);
    setErrorMessage("");
    navigate(`/seasonal/${encodeURIComponent(trimmedKeyword)}`);
  };

  return (
    <section className="page search-page">
      <div className="search-page__back-row">
        <BackButton />
      </div>
      <header className="page-heading">
        <h1>제철 검색</h1>
        <p>제철 음식, 과일, 수산물과 꽃을 검색해 보세요.</p>
      </header>

      <SearchInput
        value={keyword}
        onChange={setKeyword}
        onSubmit={searchKeyword}
        placeholder="예: 딸기, 전어, 수국"
      />
      {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

      <section className="page-section" aria-labelledby="recommended-search-heading">
        <div className="section-heading">
          <h2 id="recommended-search-heading">추천 검색어</h2>
        </div>
        <div className="keyword-list">
          {RECOMMENDED_SEARCH_KEYWORDS.map((recommendedKeyword) => (
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
