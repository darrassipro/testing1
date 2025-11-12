import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const _useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to get location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
};

export const useCurrentLocation = () => {
  const locationRef = useRef<LocationCoords | null>(null);
  const errorRef = useRef<string | null>(null);
  const loadingRef = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          errorRef.current = 'Permission to access location was denied';
          loadingRef.current = false;
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        locationRef.current = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        };
      } catch (err) {
        errorRef.current =
          err instanceof Error ? err.message : 'Unable to get location';
      } finally {
        loadingRef.current = false;
      }
    })();
  }, []);

  return {
    location: locationRef.current,
    error: errorRef.current,
    loading: loadingRef.current,
  };
};
