declare global {
  interface Window {
    kakao: Kakao;
  }
}

export interface Kakao {
  maps: KakaoMaps;
}

export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow;
  event: KakaoEvent;
}

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoLatLngBounds {
  extend(position: KakaoLatLng): void;
}

export interface KakaoMap {
  setCenter(position: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  panTo(position: KakaoLatLng): void;
  setBounds(bounds: KakaoLatLngBounds): void;
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoInfoWindowOptions {
  content: string;
}

export interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void;
}

export interface KakaoEvent {
  addListener(target: KakaoMarker, eventName: "click", handler: () => void): void;
  addListener(target: KakaoMap, eventName: "idle", handler: () => void): void;
  removeListener(
    target: KakaoMarker | KakaoMap,
    eventName: "click" | "idle",
    handler: () => void
  ): void;
}
