import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getSeasonalItems } from "../api/seasonalApi";
import calendarCornImage from "../assets/figma/calendar-raw-1.png";
import calendarFruitImage from "../assets/figma/calendar-raw-3.png";
import calendarGridImage from "../assets/figma/calendar-raw-5.png";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SeasonalVisual from "../components/seasonal/SeasonalVisual";
import type { SeasonalItem } from "../types/seasonal";

const months = Array.from({ length: 12 }, (_, index) => index + 1);

function RecommendPage() {
  const [items, setItems] = useState<SeasonalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadItems = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");

    Promise.all(months.map((month) => getSeasonalItems({ month })))
      .then((responses) => setItems(responses.flatMap((data) => data.items)))
      .catch(() => setErrorMessage("제철 달력을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const seasonalItemsByMonth = useMemo(() => {
    const uniqueItems = [...new Map(items.map((item) => [item.keyword, item])).values()];

    return new Map(
      months.map((month) => [
        month,
        uniqueItems.filter((item) => item.availableMonths.includes(month)).slice(0, 5),
      ])
    );
  }, [items]);

  return (
    <section className="page recommend-page figma-page">
      <header className="figma-page__title-row">
        <h1>제철 달력</h1>
      </header>
      {isLoading ? <LoadingState message="제철 달력을 불러오는 중입니다." /> : null}
      {errorMessage ? <ErrorState message={errorMessage} onRetry={loadItems} /> : null}
      {!isLoading && !errorMessage ? (
        <div className="seasonal-calendar" aria-label="월별 제철 달력">
          {months.map((month) => {
            const monthlyItems = seasonalItemsByMonth.get(month) || [];
            const featuredImage = month === 1 ? calendarGridImage : month === 2 ? calendarCornImage : month === 3 ? calendarFruitImage : undefined;

            return (
              <Link key={month} className="seasonal-calendar__month" to={`/search?month=${month}`}>
                <div className="seasonal-calendar__header">
                  <strong>{month}월</strong>
                  <span>{monthlyItems.length}가지</span>
                </div>
                <div className="seasonal-calendar__content">
                  {featuredImage ? <img className="seasonal-calendar__accent" src={featuredImage} alt="" /> : null}
                  <div className="seasonal-calendar__items">
                    {monthlyItems.map((item) => (
                      <div key={item.keyword} className="seasonal-calendar__item" title={item.keyword}>
                        <SeasonalVisual keyword={item.keyword} className="seasonal-calendar__item-image" />
                        <span>{item.keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default RecommendPage;
