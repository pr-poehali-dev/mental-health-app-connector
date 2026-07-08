import { useState, useEffect, useCallback } from "react";
import { loadYmaps } from "@/lib/yandexMaps";

const KEY = "user_location";
const EVENT = "user_location_changed";

export interface UserLocation {
  city: string | null;
  region: string | null;
  source: "auto" | "manual" | null;
}

const EMPTY: UserLocation = { city: null, region: null, source: null };

function load(): UserLocation {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (parsed && (parsed.city || parsed.region)) return { ...EMPTY, ...parsed };
  } catch {
    /* ignore */
  }
  return EMPTY;
}

function persist(loc: UserLocation) {
  localStorage.setItem(KEY, JSON.stringify(loc));
  window.dispatchEvent(new Event(EVENT));
}

// Достаём город и регион из объекта геокодера Яндекс.Карт
function extractFromGeoObject(geoObject: any): { city: string | null; region: string | null } {
  const locality = geoObject.getLocalities?.()[0] ?? null;
  const areas: string[] = geoObject.getAdministrativeAreas?.() ?? [];
  const region = areas[0] ?? null;
  const city = locality ?? areas[1] ?? null;
  return { city, region };
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(load);
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

  useEffect(() => {
    const handler = () => setLocation(load());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const detectAuto = useCallback((): Promise<UserLocation | null> => {
    if (!navigator.geolocation) {
      setStatus("error");
      return Promise.resolve(null);
    }
    setStatus("locating");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          loadYmaps()
            .then((ymaps) => ymaps.geocode([latitude, longitude], { kind: "locality", results: 1 }))
            .then((res: any) => {
              const geoObject = res.geoObjects.get(0);
              if (!geoObject) {
                setStatus("error");
                resolve(null);
                return;
              }
              const { city, region } = extractFromGeoObject(geoObject);
              const loc: UserLocation = { city, region, source: "auto" };
              persist(loc);
              setLocation(loc);
              setStatus("idle");
              resolve(loc);
            })
            .catch(() => {
              setStatus("error");
              resolve(null);
            });
        },
        () => {
          setStatus("error");
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }, []);

  const setManualCity = useCallback((query: string): Promise<UserLocation | null> => {
    setStatus("locating");
    return loadYmaps()
      .then((ymaps) => ymaps.geocode(query, { results: 1 }))
      .then((res: any) => {
        const geoObject = res.geoObjects.get(0);
        const extracted = geoObject ? extractFromGeoObject(geoObject) : { city: query, region: null };
        const loc: UserLocation = { city: extracted.city ?? query, region: extracted.region, source: "manual" };
        persist(loc);
        setLocation(loc);
        setStatus("idle");
        return loc;
      })
      .catch(() => {
        const loc: UserLocation = { city: query, region: null, source: "manual" };
        persist(loc);
        setLocation(loc);
        setStatus("idle");
        return loc;
      });
  }, []);

  const clearLocation = useCallback(() => {
    persist(EMPTY);
    setLocation(EMPTY);
  }, []);

  return { location, status, detectAuto, setManualCity, clearLocation };
}
