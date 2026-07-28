import { useCallback, useEffect, useRef, useState } from "react";

import { getMapPlaces } from "../api/mapApi";
import ErrorState from "../components/common/ErrorState";
import FilterTabs from "../components/common/FilterTabs";
import LoadingState from "../components/common/LoadingState";
import SaveButton from "../components/common/SaveButton";
import PageHeader from "../components/layout/PageHeader";
import PlaceCard from "../components/places/PlaceCard";
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
  { label: "채소", value: "채소" },
  { label: "수산물", value: "수산물" },
  { label: "꽃", value: "꽃" },
] as const;

function MapPage() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [maps, setMaps] = useState<KakaoMaps | null>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [category, setCategory] = useState<SeasonalCategoryFilter>("전체");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
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

    const position = new maps.LatLng(location.latitude, location.longitude);
    const marker = new maps.Marker({ position });
    map.setCenter(position);
    marker.setMap(map);

    return () => {
      marker.setMap(null);
    };
  }, [location, map, maps]);

  const loadPlaces = useCallback(() => {
    if (!location) {
      requestLocation();
      return;
    }

    setIsLoadingPlaces(true);
    setPlacesError("");

    getMapPlaces({
      latitude: location.latitude,
      longitude: location.longitude,
      month,
      category: category === "전체" ? undefined : category,
    })
      .then((data) => {
        setPlaces(data.places);
        setSelectedPlace(null);
      })
      .catch((error: unknown) => {
        setPlacesError(
          error instanceof Error ? error.message : "주변 장소를 불러오지 못했습니다."
        );
      })
      .finally(() => {
        setIsLoadingPlaces(false);
      });
  }, [category, location, month, requestLocation]);

  useEffect(() => {
    if (locationStatus === "success" && location) {
      loadPlaces();
    }
  }, [loadPlaces, location, locationStatus]);

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

  const createSavePlaceInput = (place: Place) => ({
    placeId: place.id,
    name: place.name,
    address: place.address,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    placeUrl: place.placeUrl,
  });

  return (
    <section className="page map-page">
      <PageHeader
        title="제철 지도"
        description="이번 달 제철 장소를 현재 위치 주변에서 확인합니다."
      />
      <FilterTabs
        ariaLabel="지도 장소 카테고리"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
      />
      <button className="button button--secondary" type="button" onClick={requestLocation}>
        현재 위치로 이동
      </button>
      <div ref={mapElementRef} className="map-page__canvas" />

      {mapError ? <ErrorState message={mapError} /> : null}
      {locationStatus === "loading" ? (
        <LoadingState message="현재 위치를 확인하고 있습니다." />
      ) : null}
      {["denied", "unavailable", "timeout", "unsupported", "error"].includes(locationStatus) ? (
        <ErrorState message={locationError || "현재 위치를 확인하지 못했습니다."} onRetry={requestLocation} />
      ) : null}
      {isLoadingPlaces ? <LoadingState message="주변 제철 장소를 찾고 있습니다." /> : null}
      {placesError ? <ErrorState message={placesError} onRetry={loadPlaces} /> : null}
      {!isLoadingPlaces && !placesError && locationStatus === "success" && places.length === 0 ? (
        <p className="muted-text">현재 위치 주변에서 관련 장소를 찾지 못했습니다.</p>
      ) : null}

      {selectedPlace ? (
        <section className="page-section" aria-labelledby="selected-place-heading">
          <div className="section-heading">
            <h2 id="selected-place-heading">선택한 장소</h2>
          </div>
          <PlaceCard
            place={selectedPlace}
            actions={
              <SaveButton
                isSaved={hasPlace(selectedPlace.id)}
                onClick={() => savePlace(createSavePlaceInput(selectedPlace))}
              />
            }
            onOpen={() => recordPlace(createSavePlaceInput(selectedPlace))}
          />
        </section>
      ) : null}
    </section>
  );
}

export default MapPage;
