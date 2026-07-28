import type { ReactNode } from "react";

import type { Place } from "../../types/place";

interface PlaceCardProps {
  place: Place;
  actions?: ReactNode;
  onOpen?: (place: Place) => void;
}

function formatDistance(distance: number): string {
  if (!Number.isFinite(distance) || distance <= 0) {
    return "거리 정보 없음";
  }

  if (distance < 1000) {
    return `${distance}m`;
  }

  return `${(distance / 1000).toFixed(1)}km`;
}

function PlaceCard({ place, actions, onOpen }: PlaceCardProps) {
  return (
    <article className="place-card">
      <div className="place-card__summary">
        <div>
          <h3 className="place-card__title">{place.name}</h3>
          <p className="place-card__address">{place.address || "주소 정보 없음"}</p>
          <p className="place-card__category">{place.category}</p>
        </div>
        <strong className="place-card__distance">{formatDistance(place.distance)}</strong>
      </div>

      <div className="place-card__actions">
        {actions}
        {place.placeUrl ? (
          <a
            className="button button--primary"
            href={place.placeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onOpen?.(place)}
          >
            카카오맵 보기
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default PlaceCard;
