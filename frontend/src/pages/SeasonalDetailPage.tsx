import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getDiscoverResult } from "../api/discoverApi";
import figmaBackIcon from "../assets/figma/icon-saved-back.svg";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SaveButton from "../components/common/SaveButton";
import PlacesMap from "../components/map/PlacesMap";
import SeasonalVisual from "../components/seasonal/SeasonalVisual";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRecentItems } from "../hooks/useRecentItems";
import { useSavedItems } from "../hooks/useSavedItems";
import type { Place, DiscoverResult } from "../types/place";

function SeasonalDetailPage() {
  const { keyword: keywordParam } = useParams();
  const keyword = keywordParam?.trim() || "";
  const { errorMessage: locationError, location, requestLocation, status: locationStatus } = useGeolocation();
  const { hasKeyword, hasPlace, saveKeyword, savePlace } = useSavedItems();
  const { recordKeyword, recordPlace } = useRecentItems();
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setErrorMessage("");
    setSelectedPlaceId(null);
    requestLocation();
  }, [keyword, requestLocation]);

  useEffect(() => {
    if (!keyword || locationStatus !== "success" || !location) return;
    let isActive = true;
    setIsSearching(true);
    setErrorMessage("");

    getDiscoverResult({ keyword, latitude: location.latitude, longitude: location.longitude })
      .then((data) => {
        if (isActive) setResult(data);
      })
      .catch((error: unknown) => {
        if (isActive) setErrorMessage(error instanceof Error ? error.message : "검색 결과를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isActive) setIsSearching(false);
      });

    return () => {
      isActive = false;
    };
  }, [keyword, location, locationStatus]);

  useEffect(() => {
    if (!result?.seasonalInfo) return;
    recordKeyword({ keyword: result.keyword, category: result.seasonalInfo.category, season: result.seasonalInfo.season });
  }, [recordKeyword, result]);

  const handleRetry = () => {
    setResult(null);
    setErrorMessage("");
    requestLocation();
  };

  const createStoredPlace = (place: Place) => ({
    placeId: place.id,
    name: place.name,
    address: place.address,
    category: place.category,
    relatedKeyword: result?.keyword || keyword,
    latitude: place.latitude,
    longitude: place.longitude,
    placeUrl: place.placeUrl,
  });

  return (
    <section className="page seasonal-detail-page figma-page">
      <header className="seasonal-detail-page__topbar">
        <button className="button button--text back-button back-button--icon" type="button" onClick={() => window.history.back()} aria-label="뒤로">
          <img src={figmaBackIcon} alt="" />
        </button>
        <span>제철 정보</span>
        {result?.seasonalInfo ? <SaveButton isSaved={hasKeyword(result.keyword)} onClick={() => saveKeyword({ keyword: result.keyword, category: result.seasonalInfo?.category, season: result.seasonalInfo?.season })} /> : <span />}
      </header>

      {!keyword ? <ErrorState message="검색어가 올바르지 않습니다." /> : null}
      {keyword && locationStatus === "loading" ? <LoadingState message="현재 위치를 확인하고 있습니다." /> : null}
      {keyword && ["denied", "unavailable", "timeout", "unsupported", "error"].includes(locationStatus) ? <ErrorState message={locationError || "현재 위치를 확인하지 못했습니다."} onRetry={handleRetry} /> : null}
      {keyword && locationStatus === "success" && isSearching ? <LoadingState message="AI 설명과 주변 장소를 찾고 있습니다." /> : null}
      {keyword && errorMessage ? <ErrorState message={errorMessage} onRetry={handleRetry} /> : null}

      {result?.seasonalInfo ? (
        <article className="seasonal-detail-card">
          <header className="seasonal-detail-card__heading">
            <span className="seasonal-detail-card__visual"><SeasonalVisual keyword={result.keyword} className="seasonal-detail-card__image" /></span>
            <h1>{result.keyword}</h1>
            <div className="seasonal-detail-card__badges">
              <span>{result.seasonalInfo.category}</span>
              <span>{result.seasonalInfo.season}</span>
            </div>
          </header>

          <section className="seasonal-detail-card__info" aria-labelledby="seasonal-info-heading">
            <h2 id="seasonal-info-heading">제철 정보</h2>
            <dl>
              <div><dt>제철 기간</dt><dd>{result.seasonalInfo.season}</dd></div>
              <div><dt>효능</dt><dd>{result.seasonalInfo.benefits.join(", ") || result.seasonalInfo.description}</dd></div>
              <div><dt>보관법</dt><dd>{result.seasonalInfo.relatedFoods[0] || "신선한 상태로 냉장 보관해 주세요."}</dd></div>
              <div><dt>고르는 팁</dt><dd>{result.seasonalInfo.description}</dd></div>
            </dl>
          </section>

          <section className="seasonal-detail-card__places" aria-labelledby="nearby-places-heading">
            <h2 id="nearby-places-heading">주변 관련 장소</h2>
            {result.placeSearchFailed ? <p className="muted-text">주변 장소를 일시적으로 불러오지 못했습니다.</p> : null}
            {!result.placeSearchFailed && result.places.length === 0 ? <p className="muted-text">현재 위치 주변에서 관련 장소를 찾지 못했습니다.</p> : null}
            {!result.placeSearchFailed && result.places.length > 0 ? (
              <>
                <div className="seasonal-detail-card__map-preview">
                  {location ? (
                    <PlacesMap
                      places={result.places}
                      center={location}
                      selectedPlaceId={selectedPlaceId}
                      onPlaceSelect={(place) => setSelectedPlaceId(place.id)}
                    />
                  ) : null}
                </div>
                <ul className="seasonal-detail-card__place-list">
                  {result.places.map((place) => (
                    <li key={place.id} className={selectedPlaceId === place.id ? "seasonal-detail-card__place--selected" : undefined} onClick={() => setSelectedPlaceId(place.id)}>
                      <div>
                        <a href={place.placeUrl} target="_blank" rel="noreferrer" onClick={() => recordPlace(createStoredPlace(place))}>{place.name}</a>
                        <p>{place.address || "주소 정보 없음"}</p>
                      </div>
                      <SaveButton isSaved={hasPlace(place.id)} onClick={() => savePlace(createStoredPlace(place))} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </article>
      ) : null}
    </section>
  );
}

export default SeasonalDetailPage;
