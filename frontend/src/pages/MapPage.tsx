import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getMapPlaces } from "../api/mapApi";
import { getCurrentSeasonalItems } from "../api/seasonalApi";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRecentItems } from "../hooks/useRecentItems";
import { useSavedItems } from "../hooks/useSavedItems";
import type { KakaoMap, KakaoMaps, KakaoMarker } from "../kakao";
import { getHomeSeasonalAsset } from "../lib/seasonalAsset";
import { loadKakaoMap } from "../lib/loadKakaoMap";
import type { Place } from "../types/place";
import type { SeasonalItem } from "../types/seasonal";

const defaultMarkerImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Ccircle cx='18' cy='18' r='16' fill='%23315e25' stroke='white' stroke-width='3'/%3E%3Cpath d='M18 9.5a5.7 5.7 0 0 0-5.7 5.7c0 4.3 5.7 11.3 5.7 11.3s5.7-7 5.7-11.3A5.7 5.7 0 0 0 18 9.5Zm0 8.1a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z' fill='white'/%3E%3C/svg%3E";

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

function getPlaceRelatedKeywords(place: Place): string[] {
  const keywords = place.relatedKeywords?.length
    ? place.relatedKeywords
    : [place.relatedKeyword];

  return [...new Set(keywords.filter((keyword): keyword is string => Boolean(keyword?.trim())))];
}

function isRelatedToKeyword(place: Place, keyword: string): boolean {
  return getPlaceRelatedKeywords(place).some(
    (relatedKeyword) =>
      relatedKeyword.includes(keyword) || keyword.includes(relatedKeyword)
  );
}

function MapPage() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const lastSearchCenterRef = useRef<MapCenter | null>(null);
  const placesRequestIdRef = useRef(0);
  const searchNearbyPlacesRef = useRef<(center: MapCenter) => void>(() => undefined);
  const ignoreNextMapIdleRef = useRef(false);
  const placeCardRefs = useRef(new Map<string, HTMLElement>());

  const [maps, setMaps] = useState<KakaoMaps | null>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [seasonalItems, setSeasonalItems] = useState<SeasonalItem[]>([]);
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
  const { hasPlace, removeItem, savePlace } = useSavedItems();
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

  const visiblePlaces = useMemo(
    () =>
      selectedKeyword
        ? places.filter((place) => isRelatedToKeyword(place, selectedKeyword))
        : places,
    [places, selectedKeyword]
  );

  const searchNearbyPlaces = useCallback(
    (center: MapCenter) => {
      const requestId = placesRequestIdRef.current + 1;
      placesRequestIdRef.current = requestId;
      lastSearchCenterRef.current = center;
      setShowReSearch(false);
      setIsLoadingPlaces(true);
      setPlacesError("");

      getMapPlaces({
        latitude: center.latitude,
        longitude: center.longitude,
        month,
      })
        .then((data) => {
          if (placesRequestIdRef.current !== requestId) {
            return;
          }

          setPlaces(data.places);
          setSelectedPlace(data.places[0] ?? null);
        })
        .catch((error: unknown) => {
          if (placesRequestIdRef.current !== requestId) {
            return;
          }

          setPlacesError(
            error instanceof Error
              ? error.message
              : "주변 장소를 불러오지 못했습니다."
          );
        })
        .finally(() => {
          if (placesRequestIdRef.current === requestId) {
            setIsLoadingPlaces(false);
          }
        });
    },
    [month]
  );

  useEffect(() => {
    searchNearbyPlacesRef.current = searchNearbyPlaces;
  }, [searchNearbyPlaces]);

  useEffect(() => {
    let isActive = true;

    getCurrentSeasonalItems()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setSeasonalItems(data.featured.length > 0 ? data.featured : data.items);
      })
      .catch(() => {
        if (isActive) {
          setSeasonalItems([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

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
    if (!maps || !map) {
      return;
    }

    const handleIdle = () => {
      if (ignoreNextMapIdleRef.current) {
        ignoreNextMapIdleRef.current = false;
        return;
      }

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
    markersRef.current = visiblePlaces.map((place) => {
      const relatedKeyword = getPlaceRelatedKeywords(place)[0];
      const markerImage = new maps.MarkerImage(
        getHomeSeasonalAsset(relatedKeyword) ?? defaultMarkerImage,
        new maps.Size(36, 36),
        { offset: new maps.Point(18, 18) }
      );
      const marker = new maps.Marker({
        position: new maps.LatLng(place.latitude, place.longitude),
        image: markerImage,
      });

      marker.setMap(map);
      maps.event.addListener(marker, "click", () => setSelectedPlace(place));
      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, maps, visiblePlaces]);

  useEffect(() => {
    setSelectedPlace((previousPlace) => {
      if (previousPlace && visiblePlaces.some((place) => place.id === previousPlace.id)) {
        return previousPlace;
      }

      return visiblePlaces[0] ?? null;
    });
  }, [visiblePlaces]);

  useEffect(() => {
    if (!maps || !map || !selectedPlace) {
      return;
    }

    ignoreNextMapIdleRef.current = true;
    map.panTo(new maps.LatLng(selectedPlace.latitude, selectedPlace.longitude));
    placeCardRefs.current.get(selectedPlace.id)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [map, maps, selectedPlace]);

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

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeyword((previousKeyword) =>
      previousKeyword === keyword ? null : keyword
    );
  };

  const feedback = mapError ? (
    <ErrorState message={mapError} />
  ) : ["denied", "unavailable", "timeout", "unsupported", "error"].includes(
      locationStatus
    ) ? (
    <ErrorState
      message={locationError || "현재 위치를 확인하지 못했습니다."}
      onRetry={requestLocation}
    />
  ) : locationStatus === "loading" || !maps ? (
    <LoadingState message="현재 위치와 주변 제철 장소를 찾고 있습니다." />
  ) : isLoadingPlaces ? (
    <LoadingState message="주변 제철 장소를 찾고 있습니다." />
  ) : placesError ? (
    <ErrorState message={placesError} onRetry={handleReSearch} />
  ) : null;

  return (
    <section className="map-page map-page--figma">
      <div className="map-page__viewport map-page__viewport--figma">
        <div ref={mapElementRef} className="map-page__canvas map-page__canvas--figma" />

        <div className="map-page__top-content">
          <div className="map-page__banner" aria-label="오늘의 제철 맛집 안내">
            <span className="map-page__banner-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 3.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.9 6.5 10.5 6.5 10.5S18.5 14.9 18.5 10c0-3.6-2.9-6.5-6.5-6.5Zm0 8.9A2.4 2.4 0 1 1 12 7.6a2.4 2.4 0 0 1 0 4.8Z" />
              </svg>
            </span>
            <p>오늘의 제철 맛집을 경험하세요!</p>
          </div>

          {seasonalItems.length > 0 ? (
            <div className="map-page__keyword-chips" aria-label="이달의 제철 키워드">
              {seasonalItems.map((item) => {
                const asset = getHomeSeasonalAsset(item.keyword);
                const isSelected = selectedKeyword === item.keyword;

                return (
                  <button
                    key={item.id}
                    className={
                      isSelected
                        ? "map-page__keyword-chip map-page__keyword-chip--selected"
                        : "map-page__keyword-chip"
                    }
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleKeywordSelect(item.keyword)}
                  >
                    {asset ? (
                      <img src={asset} alt="" />
                    ) : (
                      <span className="map-page__keyword-fallback" aria-hidden="true">
                        {item.keyword.slice(0, 1)}
                      </span>
                    )}
                    <span>{item.keyword}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

        </div>

        {showReSearch ? (
          <button
            className="map-page__research-button map-page__research-button--figma"
            type="button"
            onClick={handleReSearch}
          >
            이 지역 재검색
          </button>
        ) : null}

        <button
          className="map-page__location-button map-page__location-button--figma"
          type="button"
          onClick={handleCurrentLocation}
          aria-label="현재 위치로 이동"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2.75a.9.9 0 0 1 .9.9v1.64a6.76 6.76 0 0 1 5.45 5.45h1.64a.9.9 0 1 1 0 1.8h-1.64a6.76 6.76 0 0 1-5.45 5.45v1.64a.9.9 0 1 1-1.8 0v-1.64a6.76 6.76 0 0 1-5.45-5.45H4.01a.9.9 0 1 1 0-1.8h1.64A6.76 6.76 0 0 1 11.1 5.29V3.65a.9.9 0 0 1 .9-.9Zm0 4.34a4.86 4.86 0 1 0 0 9.72 4.86 4.86 0 0 0 0-9.72Zm0 2.25a2.61 2.61 0 1 1 0 5.22 2.61 2.61 0 0 1 0-5.22Z" />
          </svg>
        </button>

        {feedback ? <div className="map-page__feedback">{feedback}</div> : null}

        {!feedback && visiblePlaces.length === 0 ? (
          <p className="map-page__empty-state map-page__empty-state--figma">
            이 지역에서 찾은 제철 관련 장소가 없습니다.
          </p>
        ) : null}

        {visiblePlaces.length > 0 ? (
          <section className="map-place-carousel" aria-label="주변 제철 장소">
            <div className="map-place-carousel__track">
              {visiblePlaces.map((place) => {
                const relatedKeywords = getPlaceRelatedKeywords(place);
                const seasonalAsset = getHomeSeasonalAsset(relatedKeywords[0]);
                const isSelected = selectedPlace?.id === place.id;
                const isSaved = hasPlace(place.id);

                return (
                  <article
                    key={place.id}
                    ref={(element) => {
                      if (element) {
                        placeCardRefs.current.set(place.id, element);
                      } else {
                        placeCardRefs.current.delete(place.id);
                      }
                    }}
                    className={
                      isSelected
                        ? "map-place-card map-place-card--selected"
                        : "map-place-card"
                    }
                  >
                    <button
                      className="map-place-card__body"
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      aria-pressed={isSelected}
                    >
                      <span className="map-place-card__visual" aria-hidden="true">
                        {seasonalAsset ? (
                          <img src={seasonalAsset} alt="" />
                        ) : (
                          <svg viewBox="0 0 24 24" focusable="false">
                            <path d="M12 3.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.9 6.5 10.5 6.5 10.5S18.5 14.9 18.5 10c0-3.6-2.9-6.5-6.5-6.5Zm0 8.9A2.4 2.4 0 1 1 12 7.6a2.4 2.4 0 0 1 0 4.8Z" />
                          </svg>
                        )}
                      </span>
                      <span className="map-place-card__content">
                        <span className="map-place-card__title">{place.name}</span>
                        {relatedKeywords.length > 0 ? (
                          <span className="map-place-card__keywords">
                            {relatedKeywords.join(" · ")}
                          </span>
                        ) : null}
                        <span className="map-place-card__category">{place.category}</span>
                        <span className="map-place-card__address">
                          {place.address || "주소 정보 없음"}
                        </span>
                        {place.phone ? (
                          <span className="map-place-card__phone">{place.phone}</span>
                        ) : null}
                      </span>
                    </button>

                    <button
                      className={
                        isSaved
                          ? "map-place-card__save map-place-card__save--saved"
                          : "map-place-card__save"
                      }
                      type="button"
                      aria-label={`${place.name} ${isSaved ? "저장됨" : "저장"}`}
                      aria-pressed={isSaved}
                      onClick={() => {
                        if (isSaved) {
                          removeItem(`place:${place.id}`);
                          return;
                        }

                        savePlace(createSavePlaceInput(place));
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M12 20.1 4.9 13a5.04 5.04 0 0 1 7.1-7.1L12 6l.1-.1a5.04 5.04 0 0 1 7.1 7.1L12 20.1Z" />
                      </svg>
                    </button>

                    <div className="map-place-card__footer">
                      <span>{formatDistance(place.distance)}</span>
                      {place.placeUrl ? (
                        <a
                          href={place.placeUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => recordPlace(createSavePlaceInput(place))}
                        >
                          카카오맵에서 보기
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

export default MapPage;
