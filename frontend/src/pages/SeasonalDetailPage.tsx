import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getDiscoverResult } from "../api/discoverApi";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import SaveButton from "../components/common/SaveButton";
import PageHeader from "../components/layout/PageHeader";
import PlacesMap from "../components/map/PlacesMap";
import PlaceCard from "../components/places/PlaceCard";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRecentItems } from "../hooks/useRecentItems";
import { useSavedItems } from "../hooks/useSavedItems";
import type { DiscoverResult } from "../types/place";
import type { Place } from "../types/place";

function SeasonalDetailPage() {
  const { keyword: keywordParam } = useParams();
  const keyword = keywordParam?.trim() || "";
  const {
    errorMessage: locationError,
    location,
    requestLocation,
    status: locationStatus,
  } = useGeolocation();
  const { hasKeyword, hasPlace, saveKeyword, savePlace } = useSavedItems();
  const { recordKeyword, recordPlace } = useRecentItems();
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setSelectedPlaceId(null);
    setErrorMessage("");
    requestLocation();
  }, [keyword, requestLocation]);

  useEffect(() => {
    if (!keyword || locationStatus !== "success" || !location) {
      return;
    }

    let isActive = true;
    setIsSearching(true);
    setErrorMessage("");

    getDiscoverResult({
      keyword,
      latitude: location.latitude,
      longitude: location.longitude,
    })
      .then((data) => {
        if (isActive) {
          setResult(data);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "검색 결과를 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [keyword, location, locationStatus]);

  useEffect(() => {
    if (!result?.seasonalInfo) {
      return;
    }

    recordKeyword({
      keyword: result.keyword,
      category: result.seasonalInfo.category,
      season: result.seasonalInfo.season,
    });
  }, [recordKeyword, result]);

  const handleSaveKeyword = () => {
    if (!result?.seasonalInfo) {
      return;
    }

    saveKeyword({
      keyword: result.keyword,
      category: result.seasonalInfo.category,
      season: result.seasonalInfo.season,
    });
  };

  const handleRetry = () => {
    setResult(null);
    setSelectedPlaceId(null);
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
    <section className="page seasonal-detail-page">
      <PageHeader
        title={keyword ? `${keyword} 제철 정보` : "제철 정보"}
        description="현재 위치를 기준으로 관련 장소를 함께 보여드립니다."
        backTo="/search"
        actions={
          result?.seasonalInfo ? (
            <SaveButton isSaved={hasKeyword(result.keyword)} onClick={handleSaveKeyword} />
          ) : null
        }
      />

      {!keyword ? <ErrorState message="검색어가 올바르지 않습니다." /> : null}
      {keyword && locationStatus === "loading" ? (
        <LoadingState message="현재 위치를 확인하고 있습니다." />
      ) : null}
      {keyword && ["denied", "unavailable", "timeout", "unsupported", "error"].includes(locationStatus) ? (
        <ErrorState message={locationError || "현재 위치를 확인하지 못했습니다."} onRetry={handleRetry} />
      ) : null}
      {keyword && locationStatus === "success" && isSearching ? (
        <LoadingState message="AI 설명과 주변 장소를 찾고 있습니다." />
      ) : null}
      {keyword && errorMessage ? <ErrorState message={errorMessage} onRetry={handleRetry} /> : null}

      {result?.seasonalInfo ? (
        <>
          <section className="detail-summary">
            <div className="detail-summary__meta">
              <span>{result.seasonalInfo.category}</span>
              <span>{result.seasonalInfo.season}</span>
            </div>
            <p>{result.seasonalInfo.description}</p>
            {result.seasonalInfo.benefits.length > 0 ? (
              <div>
                <h2>특징</h2>
                <ul className="bullet-list">
                  {result.seasonalInfo.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.seasonalInfo.relatedFoods.length > 0 ? (
              <div>
                <h2>관련 음식</h2>
                <ul className="bullet-list">
                  {result.seasonalInfo.relatedFoods.map((food) => (
                    <li key={food}>{food}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="page-section seasonal-detail-places" aria-labelledby="nearby-places-heading">
            <div className="section-heading">
              <div>
                <h2 id="nearby-places-heading">주변 관련 장소</h2>
                <p>현재 위치에서 가까운 순서입니다.</p>
              </div>
              <span>{result.places.length}곳</span>
            </div>
            {result.placeSearchFailed ? (
              <p className="muted-text">
                주변 장소 검색을 일시적으로 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            ) : result.places.length === 0 ? (
              <p className="muted-text">현재 위치 주변에서 관련 장소를 찾지 못했습니다.</p>
            ) : (
              <div className="seasonal-detail-place-list">
                {location ? (
                  <PlacesMap
                    places={result.places}
                    center={{ latitude: location.latitude, longitude: location.longitude }}
                    selectedPlaceId={selectedPlaceId}
                    onPlaceSelect={(place) => setSelectedPlaceId(place.id)}
                  />
                ) : null}
                <div className="content-list">
                {result.places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    selected={selectedPlaceId === place.id}
                    onSelect={(selectedPlace) => setSelectedPlaceId(selectedPlace.id)}
                    actions={
                      <SaveButton
                        isSaved={hasPlace(place.id)}
                        onClick={() => savePlace(createStoredPlace(place))}
                      />
                    }
                    onOpen={() => recordPlace(createStoredPlace(place))}
                  />
                ))}
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}

export default SeasonalDetailPage;
