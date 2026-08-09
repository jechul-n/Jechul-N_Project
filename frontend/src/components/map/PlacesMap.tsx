import { useEffect, useRef, useState } from "react";

import ErrorState from "../common/ErrorState";
import LoadingState from "../common/LoadingState";
import { loadKakaoMap } from "../../lib/loadKakaoMap";
import type { KakaoMap, KakaoMaps, KakaoMarker } from "../../kakao";
import type { Place } from "../../types/place";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PlacesMapProps {
  places: Place[];
  center: Coordinates;
  selectedPlaceId?: string | null;
  onPlaceSelect?: (place: Place) => void;
}

function hasCoordinates(place: Place): boolean {
  return Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
}

function PlacesMap({ places, center, selectedPlaceId, onPlaceSelect }: PlacesMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [maps, setMaps] = useState<KakaoMaps | null>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let isActive = true;

    loadKakaoMap()
      .then((loadedMaps) => {
        if (!isActive || !mapElementRef.current) return;
        mapRef.current = new loadedMaps.Map(mapElementRef.current, {
          center: new loadedMaps.LatLng(center.latitude, center.longitude),
          level: 4,
        });
        setMaps(loadedMaps);
      })
      .catch((error: unknown) => {
        if (isActive) setMapError(error instanceof Error ? error.message : "카카오 지도를 불러오지 못했습니다.");
      });

    return () => {
      isActive = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    if (!maps || !mapRef.current) return;
    const map = mapRef.current;
    const validPlaces = places.filter(hasCoordinates);
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = validPlaces.map((place) => {
      const marker = new maps.Marker({ position: new maps.LatLng(place.latitude, place.longitude) });
      marker.setMap(map);
      maps.event.addListener(marker, "click", () => onPlaceSelect?.(place));
      return marker;
    });

    if (validPlaces.length > 1) {
      const bounds = new maps.LatLngBounds();
      validPlaces.forEach((place) => bounds.extend(new maps.LatLng(place.latitude, place.longitude)));
      map.setBounds(bounds);
    } else {
      map.setCenter(new maps.LatLng(center.latitude, center.longitude));
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [center.latitude, center.longitude, maps, onPlaceSelect, places]);

  useEffect(() => {
    if (!maps || !mapRef.current || !selectedPlaceId) return;
    const selectedPlace = places.find((place) => place.id === selectedPlaceId);
    if (selectedPlace && hasCoordinates(selectedPlace)) {
      mapRef.current.panTo(new maps.LatLng(selectedPlace.latitude, selectedPlace.longitude));
    }
  }, [maps, places, selectedPlaceId]);

  if (mapError) return <ErrorState message={mapError} />;

  return (
    <div className="seasonal-detail-map-container">
      <div ref={mapElementRef} className="seasonal-detail-map" />
      {!maps ? <LoadingState message="주변 장소 지도를 불러오는 중입니다." /> : null}
    </div>
  );
}

export default PlacesMap;
