import { useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import FilterTabs from "../components/common/FilterTabs";
import BackButton from "../components/common/BackButton";
import SavedEmptyState from "../components/saved/SavedEmptyState";
import { useRecentItems } from "../hooks/useRecentItems";
import type { StoredItemType } from "../types/storage";

type RecentFilter = "전체" | StoredItemType;

const filterOptions = [
  { label: "전체", value: "전체" },
  { label: "키워드", value: "keyword" },
  { label: "장소", value: "place" },
] as const;

function RecentPage() {
  const [filter, setFilter] = useState<RecentFilter>("전체");
  const { clearItems, items, removeItem } = useRecentItems();
  const filteredItems =
    filter === "전체" ? items : items.filter((item) => item.type === filter);

  return (
    <section className="page saved-page recent-page">
      <header className="saved-page__header">
        <BackButton iconOnly />
        <h1>최근 본 항목</h1>
        {items.length > 0 ? (
          <button className="button button--text recent-page__clear-button" type="button" onClick={clearItems}>
            전체 삭제
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </header>
      <FilterTabs
        ariaLabel="최근 본 항목 필터"
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />
      {items.length === 0 ? (
        <SavedEmptyState
          title="아직 최근 본 항목이 없어요"
          description={"제철 정보나 장소를 확인하면\n여기에서 쉽게 확인할 수 있어요."}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={`최근 본 ${filter === "keyword" ? "키워드" : "장소"}가 없습니다.`}
        />
      ) : (
        <ul className="stored-item-list">
          {filteredItems.map((item) => (
            <li key={item.id} className="stored-item">
              <div>
                <span className="stored-item__type">
                  {item.type === "keyword" ? "키워드" : "장소"}
                </span>
                {item.type === "keyword" ? (
                  <Link className="stored-item__title" to={`/seasonal/${encodeURIComponent(item.keyword)}`}>
                    {item.keyword}
                  </Link>
                ) : item.placeUrl ? (
                  <a className="stored-item__title" href={item.placeUrl} target="_blank" rel="noreferrer">
                    {item.name}
                  </a>
                ) : (
                  <strong className="stored-item__title">{item.name}</strong>
                )}
                <p>{item.type === "keyword" ? item.season || item.category : item.address}</p>
              </div>
              <button className="button button--text" type="button" onClick={() => removeItem(item.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentPage;
