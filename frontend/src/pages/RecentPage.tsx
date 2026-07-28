import { useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import FilterTabs from "../components/common/FilterTabs";
import PageHeader from "../components/layout/PageHeader";
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
    <section className="page recent-page">
      <PageHeader
        title="최근 본 항목"
        description="최근에 확인한 제철 키워드와 장소를 최신순으로 보여줍니다."
        actions={
          items.length > 0 ? (
            <button className="button button--text" type="button" onClick={clearItems}>
              전체 삭제
            </button>
          ) : null
        }
      />
      <FilterTabs
        ariaLabel="최근 본 항목 필터"
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />
      {filteredItems.length === 0 ? (
        <EmptyState
          title="최근 본 항목이 없습니다."
          description="제철 상세 정보나 장소를 확인하면 여기에 기록됩니다."
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
