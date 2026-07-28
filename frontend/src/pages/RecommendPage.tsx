import { useCallback, useEffect, useState } from "react";

import { getSeasonalItems } from "../api/seasonalApi";
import ErrorState from "../components/common/ErrorState";
import FilterTabs from "../components/common/FilterTabs";
import LoadingState from "../components/common/LoadingState";
import PageHeader from "../components/layout/PageHeader";
import SeasonalKeywordCard from "../components/seasonal/SeasonalKeywordCard";
import type {
  SeasonalCategoryFilter,
  SeasonalItem,
} from "../types/seasonal";

const categoryOptions = [
  { label: "전체", value: "전체" },
  { label: "과일", value: "과일" },
  { label: "채소", value: "채소" },
  { label: "수산물", value: "수산물" },
  { label: "꽃", value: "꽃" },
] as const;

function RecommendPage() {
  const [category, setCategory] = useState<SeasonalCategoryFilter>("전체");
  const [items, setItems] = useState<SeasonalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const month = new Date().getMonth() + 1;

  const loadItems = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");

    getSeasonalItems({
      month,
      category: category === "전체" ? undefined : category,
    })
      .then((data) => {
        setItems(data.items);
      })
      .catch(() => {
        setErrorMessage("이번 달 제철 추천을 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [category, month]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <section className="page recommend-page">
      <PageHeader
        title="이번 달 제철 추천"
        description={`${month}월에 제철인 항목을 카테고리별로 확인해 보세요.`}
      />
      <FilterTabs
        ariaLabel="제철 추천 카테고리"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />
      {isLoading ? <LoadingState message="제철 추천을 불러오는 중입니다." /> : null}
      {errorMessage ? <ErrorState message={errorMessage} onRetry={loadItems} /> : null}
      {!isLoading && !errorMessage && items.length === 0 ? (
        <p className="muted-text">선택한 카테고리에 제철 항목이 없습니다.</p>
      ) : null}
      {!isLoading && !errorMessage && items.length > 0 ? (
        <div className="card-grid">
          {items.map((item) => (
            <SeasonalKeywordCard key={item.keyword} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default RecommendPage;
