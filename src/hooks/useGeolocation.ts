import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationState {
  isSupported: boolean;
  isLocating: boolean;
  coords: GeolocationCoordinates | null;
  timestamp: number | null;
  error: string | null;
  errorCode: number | null;
  permissionState: 'granted' | 'prompt' | 'denied' | 'unknown';
}

export interface UseGeolocationOptions extends PositionOptions {
  autoDetect?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 30000,
    autoDetect = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    isLocating: false,
    coords: null,
    timestamp: null,
    error: null,
    errorCode: null,
    permissionState: 'unknown',
  });

  const watchIdRef = useRef<number | null>(null);

  // Check initial permission status if Permissions API is supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus) => {
          setState((prev) => ({
            ...prev,
            permissionState: permissionStatus.state,
          }));

          permissionStatus.onchange = () => {
            setState((prev) => ({
              ...prev,
              permissionState: permissionStatus.state,
            }));
          };
        })
        .catch(() => {
          // Permissions API query not supported or failed
        });
    }
  }, []);

  /**
   * Request current position using browser's built-in navigator.geolocation.getCurrentPosition
   */
  const getCurrentPosition = useCallback(
    (customOptions?: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
          const err = new Error('Geolocation is not supported by your browser.');
          setState((prev) => ({
            ...prev,
            isLocating: false,
            error: err.message,
            errorCode: 0,
          }));
          reject(err);
          return;
        }

        setState((prev) => ({
          ...prev,
          isLocating: true,
          error: null,
          errorCode: null,
        }));

        const geoOptions: PositionOptions = {
          enableHighAccuracy,
          timeout,
          maximumAge,
          ...customOptions,
        };

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: GeolocationCoordinates = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            };

            setState({
              isSupported: true,
              isLocating: false,
              coords,
              timestamp: pos.timestamp,
              error: null,
              errorCode: null,
              permissionState: 'granted',
            });

            resolve(pos);
          },
          (err) => {
            let errorMsg = 'An unknown error occurred while detecting your location.';
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMsg =
                  'Location access denied. Please enable location permissions in your browser or search for a location manually.';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMsg =
                  'GPS/location position is currently unavailable. Please check your network or device location settings.';
                break;
              case err.TIMEOUT:
                errorMsg =
                  'Location request timed out. Please try again or ensure your GPS signal is available.';
                break;
            }

            setState((prev) => ({
              ...prev,
              isLocating: false,
              error: errorMsg,
              errorCode: err.code,
              permissionState: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permissionState,
            }));

            reject(err);
          },
          geoOptions
        );
      });
    },
    [enableHighAccuracy, timeout, maximumAge]
  );

  /**
   * Clears active errors
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, errorCode: null }));
  }, []);

  /**
   * Starts continuous watch of position if needed
   */
  const startWatching = useCallback(
    (customOptions?: PositionOptions) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;
      if (watchIdRef.current !== null) return;

      const geoOptions: PositionOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge,
        ...customOptions,
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setState({
            isSupported: true,
            isLocating: false,
            coords: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
            timestamp: pos.timestamp,
            error: null,
            errorCode: null,
            permissionState: 'granted',
          });
        },
        (err) => {
          setState((prev) => ({
            ...prev,
            isLocating: false,
            error: err.message,
            errorCode: err.code,
          }));
        },
        geoOptions
      );
    },
    [enableHighAccuracy, timeout, maximumAge]
  );

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-detect on mount if requested
  useEffect(() => {
    if (autoDetect) {
      getCurrentPosition().catch(() => {
        // Silently handled via state.error
      });
    }
  }, [autoDetect, getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
    clearError,
    startWatching,
    stopWatching,
  };
}
