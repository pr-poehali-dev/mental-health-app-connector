import { useState, useEffect, useCallback } from "react";

const KEY = "user_location";
const EVENT = "user_location_changed";
const NOMINATIM_HEADERS = { "Accept-Language": "ru" };

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

// Извлекаем город и регион из адреса Nominatim (OpenStreetMap) — бесплатный геокодер,
// не требует API-ключа и работает прямо из браузера.
function extractFromAddress(address: Record<string, string>): { city: string | null; region: string | null } {
  const city =
    address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? null;
  const region = address.state ?? address.region ?? null;
  return { city, region };
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string | null; region: string | null } | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=10`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.address) return null;
  return extractFromAddress(data.address);
}

async function forwardGeocode(query: string): Promise<{ city: string | null; region: string | null } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=ru`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length || !data[0].address) return null;
  return extractFromAddress(data[0].address);
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
          reverseGeocode(latitude, longitude)
            .then((extracted) => {
              if (!extracted || (!extracted.city && !extracted.region)) {
                setStatus("error");
                resolve(null);
                return;
              }
              const loc: UserLocation = { city: extracted.city, region: extracted.region, source: "auto" };
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
    return forwardGeocode(query)
      .then((extracted) => {
        const loc: UserLocation = {
          city: extracted?.city ?? query,
          region: extracted?.region ?? null,
          source: "manual",
        };
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
