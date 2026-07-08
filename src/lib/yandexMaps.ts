export const MAP_CONFIG_URL = "https://functions.poehali.dev/fe29379b-7928-4851-b5c5-5d6085a53f7b";

declare global {
  interface Window {
    ymaps?: any;
  }
}

let apiKeyPromise: Promise<string | null> | null = null;
let ymapsLoadPromise: Promise<any> | null = null;

function fetchApiKey(): Promise<string | null> {
  if (!apiKeyPromise) {
    apiKeyPromise = fetch(MAP_CONFIG_URL)
      .then((r) => r.json())
      .then((d) => d.apiKey ?? null)
      .catch(() => null);
  }
  return apiKeyPromise;
}

// Общая загрузка Яндекс.Карт JS API — используется и картой каталога, и геолокацией (реверс-геокодинг)
export function loadYmaps(): Promise<any> {
  if (window.ymaps) return Promise.resolve(window.ymaps);
  if (ymapsLoadPromise) return ymapsLoadPromise;

  ymapsLoadPromise = fetchApiKey().then((apiKey) => {
    if (!apiKey) throw new Error("no api key");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.onload = () => {
        window.ymaps.ready(() => resolve(window.ymaps));
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  });

  return ymapsLoadPromise;
}

export function parseCoords(raw: string | null): [number, number] | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
}
