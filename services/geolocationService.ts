
// services/geolocationService.ts

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface GeolocationResponse {
  success: boolean;
  location?: UserLocation;
  error?: GeolocationPositionError | string;
  message: string;
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
        message: 'Geolocation is not supported by your browser.',
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
          message: 'Location fetched successfully.',
        });
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        resolve({
          success: false,
          message: errorMessage,
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
