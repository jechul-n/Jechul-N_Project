import { useEffect, useRef } from "react";

function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

    const script = document.createElement("script");

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const defaultPosition = new window.kakao.maps.LatLng(
          37.5563,
          126.922
        );

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: defaultPosition,
          level: 4,
        });

        if (!navigator.geolocation) {
          console.log("현재 위치 기능을 지원하지 않는 브라우저입니다.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const currentPosition = new window.kakao.maps.LatLng(
              latitude,
              longitude
            );

            map.setCenter(currentPosition);

            const marker = new window.kakao.maps.Marker({
              position: currentPosition,
            });

            marker.setMap(map);

            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="
                  padding: 8px 12px;
                  font-size: 13px;
                  white-space: nowrap;
                ">
                  현재 위치
                </div>
              `,
            });

            infoWindow.open(map, marker);
          },
          (error) => {
            console.error("현재 위치를 가져오지 못했습니다.", error);

            const marker = new window.kakao.maps.Marker({
              position: defaultPosition,
            });

            marker.setMap(map);
          }
        );
      });
    };

    script.onerror = () => {
      console.error("카카오 지도 SDK 로드 실패");
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main style={{ padding: "24px" }}>
      <h1>지도</h1>
      <p>현재 제철인 장소를 지도에서 확인해 보세요.</p>

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      />
    </main>
  );
}

export default MapPage;