import type { KakaoMaps } from "../kakao";

const KAKAO_MAP_SCRIPT_ID = "kakao-map-sdk";

let kakaoMapsPromise: Promise<KakaoMaps> | null = null;

function waitForKakaoMaps(): Promise<KakaoMaps> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps) {
      reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
      return;
    }

    window.kakao.maps.load(() => {
      resolve(window.kakao!.maps);
    });
  });
}

export function loadKakaoMap(): Promise<KakaoMaps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 카카오 지도를 사용할 수 있습니다."));
  }

  if (window.kakao?.maps) {
    return waitForKakaoMaps();
  }

  if (kakaoMapsPromise) {
    return kakaoMapsPromise;
  }

  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  if (!apiKey) {
    return Promise.reject(new Error("VITE_KAKAO_MAP_KEY가 설정되지 않았습니다."));
  }

  const nextPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const completeLoading = () => {
      waitForKakaoMaps().then(resolve).catch(reject);
    };
    const failLoading = () => {
      reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    };
    const existingScript = document.getElementById(
      KAKAO_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", completeLoading, { once: true });
      existingScript.addEventListener("error", failLoading, { once: true });

      if (window.kakao?.maps) {
        completeLoading();
      }

      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(apiKey)}&autoload=false`;
    script.async = true;
    script.addEventListener("load", completeLoading, { once: true });
    script.addEventListener("error", failLoading, { once: true });
    document.head.appendChild(script);
  }).catch((error: unknown): never => {
    kakaoMapsPromise = null;
    throw error;
  });

  kakaoMapsPromise = nextPromise;
  return nextPromise;
}
