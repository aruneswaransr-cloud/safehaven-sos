import { useEffect, useRef, useState } from "react";

export type Coords = { lat: number; lng: number; accuracy: number; ts: number };

export function useGeolocation(active: boolean) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: pos.timestamp,
        });
        setError(null);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [active]);

  const getCurrent = () =>
    new Promise<Coords>((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            ts: pos.timestamp,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  return { coords, error, getCurrent };
}
