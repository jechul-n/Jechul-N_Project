import { useCallback, useEffect, useRef, useState } from "react";

import { getMapPlaces } from "../api/mapApi";
import ErrorState from "../components/common/ErrorState";
import FilterTabs from "../components/common/FilterTabs";
import LoadingState from "../components/common/LoadingState";
import SaveButton from "../components/common/SaveButton";
import PageHeader from "../components/layout/PageHeader";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRecentItems } from "../hooks/useRecentItems";
import { useSavedItems } from "../hooks/useSavedItems";
import { loadKakaoMap } from "../lib/loadKakaoMap";
import type { KakaoMap, KakaoMaps, KakaoMarker } from "../kakao";
import type { Place } from "../types/place";
import type { SeasonalCategoryFilter } from "../types/seasonal";

const categoryOptions = [
  { label: "전체", value: "전체" },
  { label: "과일", value: "과일" },
  { label: "해산물", value: "해산물" },
  { label: "채소", value: "채소" },
] as const;

interface MapCenter {
  latitude: number;
  longitude: number;
}

function isSameCenter(first: MapCenter | null, second: MapCenter): boolean {
  if (!first) {
    return false;
  }

  return (
    Math.abs(first.latitude - second.latitude) < 0.00002 &&
    Math.abs(first.longitude - second.longitude) < 0.00002
  );
}

function formatDistance(distance: number): string {
  if (!Number.isFinite(distance) || distance <= 0) {
    return "거리 정보 없음";
  }

  return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`;
}

function MapPage() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const lastSearchCenterRef = useRef<MapCenter | null>(null);
  const placesRequestIdRef = useRef(0);
  const searchNearbyPlacesRef = useRef<(center: MapCenter) => void>(() => undefined);
  const selectedCategoryRef = useRef<SeasonalCategoryFilter>("전체");
  const [maps, setMaps] = useState<KakaoMaps | null>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [category, setCategory] = useState<SeasonalCategoryFilter>("전체");
  const [searchCenter, setSearchCenter] = useState<MapCenter | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showReSearch, setShowReSearch] = useState(false);
  const [mapError, setMapError] = useState("");
  const [placesError, setPlacesError] = useState("");
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const {
    errorMessage: locationError,
    location,
    requestLocation,
    status: locationStatus,
  } = useGeolocation();
  const { hasPlace, savePlace } = useSavedItems();
  const { recordPlace } = useRecentItems();
  const month = new Date().getMonth() + 1;

  const createSavePlaceInput = useCallback((place: Place) => ({
    placeId: place.id,
    name: place.name,
    address: place.address,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    placeUrl: place.placeUrl,
    relatedKeyword: place.relatedKeyword,
  }), []);

  const searchNearbyPlaces = useCallback(
    (center: MapCenter) => {
      const requestId = placesRequestIdRef.current + 1;
      placesRequestIdRef.current = requestId;
      lastSearchCenterRef.current = center;
      setSearchCenter((previousCenter) =>
        isSameCenter(previousCenter, center) ? previousCenter : center
      );
      setShowReSearch(false);
      setIsLoadingPlaces(true);
      setPlacesError("");

      getMapPlaces({
        latitude: center.latitude,
        longitude: center.longitude,
        month,
        category: category === "전체" ? undefined : category,
      })
        .then((data) => {
          if (placesRequestIdRef.current !== requestId) {
            return;
          }

          setPlaces(data.places);
          setSelectedPlace(null);
        })
        .catch((error: unknown) => {
          if (placesRequestIdRef.current !== requestId) {
            return;
          }

          setPlacesError(
            error instanceof Error ? error.message : "주변 장소를 불러오지 못했습니다."
          );
        })
        .finally(() => {
          if (placesRequestIdRef.current === requestId) {
            setIsLoadingPlaces(false);
          }
        });
    },
    [category, month]
  );

  useEffect(() => {
    searchNearbyPlacesRef.current = searchNearbyPlaces;
  }, [searchNearbyPlaces]);

  useEffect(() => {
    let isActive = true;

    loadKakaoMap()
      .then((loadedMaps) => {
        if (!isActive || !mapElementRef.current) {
          return;
        }

        const defaultPosition = new loadedMaps.LatLng(37.5563, 126.922);
        setMaps(loadedMaps);
        setMap(
          new loadedMaps.Map(mapElementRef.current, {
            center: defaultPosition,
            level: 4,
          })
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setMapError(
            error instanceof Error
              ? error.message
              : "카카오 지도를 불러오지 못했습니다."
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!maps || !map || !location) {
      return;
    }

    const center = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    const position = new maps.LatLng(center.latitude, center.longitude);
    const marker = new maps.Marker({ position });
    map.setCenter(position);
    marker.setMap(map);
    searchNearbyPlacesRef.current(center);

    return () => {
      marker.setMap(null);
    };
  }, [location, map, maps]);

  useEffect(() => {
    if (selectedCategoryRef.current === category) {
      return;
    }

    selectedCategoryRef.current = category;

    if (searchCenter) {
      searchNearbyPlaces(searchCenter);
    }
  }, [category, searchCenter, searchNearbyPlaces]);

  useEffect(() => {
    if (!maps || !map) {
      return;
    }

    const handleIdle = () => {
      const center = map.getCenter();
      const currentCenter = {
        latitude: center.getLat(),
        longitude: center.getLng(),
      };

      if (lastSearchCenterRef.current) {
        setShowReSearch(!isSameCenter(lastSearchCenterRef.current, currentCenter));
      }
    };

    maps.event.addListener(map, "idle", handleIdle);

    return () => {
      maps.event.removeListener(map, "idle", handleIdle);
    };
  }, [map, maps]);

  useEffect(() => {
    if (!maps || !map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = places.map((place) => {
      const marker = new maps.Marker({
        position: new maps.LatLng(place.latitude, place.longitude),
      });
      marker.setMap(map);
      maps.event.addListener(marker, "click", () => setSelectedPlace(place));
      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, maps, places]);

  const handleCurrentLocation = () => {
    setShowReSearch(false);
    requestLocation();
  };

  const handleReSearch = () => {
    if (!map) {
      return;
    }

    const center = map.getCenter();
    searchNearbyPlaces({
      latitude: center.getLat(),
      longitude: center.getLng(),
    });
  };

  const relatedKeywords = selectedPlace
    ? [
        ...new Set(
          selectedPlace.relatedKeywords?.length
            ? selectedPlace.relatedKeywords
            : [selectedPlace.relatedKeyword].filter(Boolean)
        ),
      ]
    : [];

  return (
    <section className="page map-page">
      <PageHeader
        title="제철 지도"
        description="이번 달 제철 장소를 현재 위치 주변에서 확인합니다."
      />

      <div className="map-page__viewport">
        <div ref={mapElementRef} className="map-page__canvas" />

        <div className="map-page__controls">
          <FilterTabs
            ariaLabel="지도 장소 카테고리"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          <button
            className="button button--secondary map-page__location-button"
            type="button"
            onClick={handleCurrentLocation}
          >
            현재 위치로 이동
          </button>
        </div>

        {showReSearch ? (
          <button
            className="button button--primary map-page__research-button"
            type="button"
            onClick={handleReSearch}
          >
            이 지역 재검색
          </button>
        ) : null}

        {mapError ? (
          <div className="map-page__state">
            <ErrorState message={mapError} />
          </div>
        ) : null}
        {locationStatus === "loading" ? (
          <div className="map-page__state">
            <LoadingState message="현재 위치를 확인하고 있습니다." />
          </div>
        ) : null}
        {["denied", "unavailable", "timeout", "unsupported", "error"].includes(
          locationStatus
        ) ? (
          <div className="map-page__state">
            <ErrorState
              message={locationError || "현재 위치를 확인하지 못했습니다."}
              onRetry={requestLocation}
            />
          </div>
        ) : null}
        {isLoadingPlaces ? (
          <div className="map-page__state">
            <LoadingState message="주변 제철 장소를 찾고 있습니다." />
          </div>
        ) : null}
        {placesError ? (
          <div className="map-page__state">
            <ErrorState message={placesError} onRetry={handleReSearch} />
          </div>
        ) : null}
        {!isLoadingPlaces &&
        !placesError &&
        locationStatus === "success" &&
        places.length === 0 ? (
          <p className="map-page__empty-state">
            이번 달 제철 관련 추천 장소가 없습니다.
          </p>
        ) : null}

        {selectedPlace ? (
          <aside className="map-place-overlay" aria-label={`${selectedPlace.name} 상세`}>
            <div className="map-place-overlay__heading">
              <div>
                <h2>{selectedPlace.name}</h2>
                <p>{selectedPlace.category}</p>
              </div>
              <button
                className="button button--text"
                type="button"
                onClick={() => setSelectedPlace(null)}
              >
                닫기
              </button>
            </div>
            {relatedKeywords.length > 0 ? (
              <p className="map-place-overlay__seasonal">
                {month}월 제철 · {relatedKeywords.join(" · ")}
              </p>
            ) : null}
            <p>현재 검색 중심에서 {formatDistance(selectedPlace.distance)}</p>
            <p>{selectedPlace.address || "주소 정보 없음"}</p>
            {selectedPlace.phone ? <p>{selectedPlace.phone}</p> : null}
            <div className="map-place-overlay__actions">
              <SaveButton
                isSaved={hasPlace(selectedPlace.id)}
                onClick={() => savePlace(createSavePlaceInput(selectedPlace))}
              />
              {selectedPlace.placeUrl ? (
                <a
                  className="button button--primary"
                  href={selectedPlace.placeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => recordPlace(createSavePlaceInput(selectedPlace))}
                >
                  카카오맵에서 보기
                </a>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export default MapPage;
