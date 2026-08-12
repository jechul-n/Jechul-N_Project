import { useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import FilterTabs from "../components/common/FilterTabs";
import BackButton from "../components/common/BackButton";
import SavedEmptyState from "../components/saved/SavedEmptyState";
import { useSavedItems } from "../hooks/useSavedItems";
import type { StoredItemType } from "../types/storage";

type SavedFilter = "전체" | StoredItemType;

const filterOptions = [
  { label: "전체", value: "전체" },
  { label: "키워드", value: "keyword" },
  { label: "장소", value: "place" },
] as const;

function SavedPage() {
  const [filter, setFilter] = useState<SavedFilter>("전체");
  const { items, removeItem } = useSavedItems();
  const filteredItems =
    filter === "전체" ? items : items.filter((item) => item.type === filter);

  return (
    <section className="page saved-page">
      <header className="saved-page__header">
        <BackButton iconOnly />
        <h1>저장한 항목</h1>
        <span aria-hidden="true" />
      </header>
      <FilterTabs
        ariaLabel="저장 항목 필터"
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />
      {items.length === 0 ? (
        <SavedEmptyState />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={`저장한 ${filter === "keyword" ? "키워드" : "장소"}가 없습니다.`}
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

export default SavedPage;
