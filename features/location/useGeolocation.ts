
import { useState, useEffect } from 'react';
import { Coordinates } from '../../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const handleError = (err?: GeolocationPositionError) => {
      setError(err?.message || 'Geolocation failed');
      // Default fallback to San Francisco
      setLocation({ latitude: 37.7749, longitude: -122.4194 });
    };

    if (!navigator.geolocation) {
      handleError();
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }
  }, []);

  return { location, error };
};
