
// services/geolocationService.ts

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface GeolocationResponse {
  success: boolean;
  location?: UserLocation;
  error?: GeolocationPositionError | string;
  message: string; // This will now be a translation key
}

/**
 * Attempts to get the user's current geographical location.
 * Requires 'geolocation' permission.
 * @returns A promise that resolves to a GeolocationResponse indicating success/failure and location data.
 */
export const getUserLocation = (): Promise<GeolocationResponse> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        message: 'geolocation_unsupportedBrowser', // Translation key
        error: 'UnsupportedBrowser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          message: 'locationFetchedSuccessfully', // Translation key
        });
      },
      (error) => {
        let messageKey: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            messageKey = 'geolocation_permissionDenied'; // Translation key
            break;
          case error.POSITION_UNAVAILABLE:
            messageKey = 'geolocation_positionUnavailable'; // Translation key
            break;
          case error.TIMEOUT:
            messageKey = 'geolocation_timeout'; // Translation key
            break;
          default:
            messageKey = 'geolocation_unknownError'; // Translation key
            break;
        }
        resolve({
          success: false,
          message: messageKey,
          error: error,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0, // No cached position
      }
    );
  });
};