import { useCallback, useState } from "react";

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "success"
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationState {
  status: GeolocationStatus;
  location: UserLocation | null;
  errorMessage: string | null;
}

const initialState: GeolocationState = {
  status: "idle",
  location: null,
  errorMessage: null,
};

function getErrorState(error: GeolocationPositionError): GeolocationState {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: "denied",
      location: null,
      errorMessage: "현재 위치를 사용하려면 브라우저의 위치 권한을 허용해 주세요.",
    };
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      status: "unavailable",
      location: null,
      errorMessage: "현재 위치를 확인하지 못했습니다.",
    };
  }

  if (error.code === error.TIMEOUT) {
    return {
      status: "timeout",
      location: null,
      errorMessage: "현재 위치 확인 시간이 초과되었습니다.",
    };
  }

  return {
    status: "error",
    location: null,
    errorMessage: "현재 위치를 불러오는 중 오류가 발생했습니다.",
  };
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(initialState);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "unsupported",
        location: null,
        errorMessage: "현재 위치 기능을 지원하지 않는 브라우저입니다.",
      });
      return;
    }

    setState({
      status: "loading",
      location: null,
      errorMessage: null,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          errorMessage: null,
        });
      },
      (error) => {
        setState(getErrorState(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 300_000,
      }
    );
  }, []);

  const resetLocation = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading",
    requestLocation,
    resetLocation,
  };
}
