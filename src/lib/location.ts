// Утилиты для сопоставления организаций с городом/регионом пользователя.
// Данные в БД неоднородны (город может быть "г. Омск", "Омск", "с. Дубасово" и т.д.),
// поэтому используем сопоставление по вхождению подстроки после нормализации.

const CITY_PREFIXES = [
  "г.", "г ", "город ", "с.", "с ", "село ", "д.", "д ", "деревня ",
  "п.", "п ", "пос.", "поселок ", "посёлок ", "рп ", "р.п.", "пгт ", "пгт. ",
];

export function normalizeCity(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.trim().toLowerCase();
  for (const prefix of CITY_PREFIXES) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length).trim();
      break;
    }
  }
  return s;
}

// Ключевое слово региона для текстового поиска в адресе (убираем суффиксы вида "область", "край" и т.п.)
export function regionKeyword(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/(автономный округ|автономная область|область|обл\.?|край|республика|респ\.?)/g, "")
    .trim();
}

export function matchesCity(orgCity: string | null | undefined, targetCity: string): boolean {
  const a = normalizeCity(orgCity);
  const b = normalizeCity(targetCity);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export function matchesRegion(
  orgCity: string | null | undefined,
  orgAddress: string | null | undefined,
  targetRegion: string
): boolean {
  const keyword = regionKeyword(targetRegion);
  if (!keyword) return false;
  const haystack = `${orgCity ?? ""} ${orgAddress ?? ""}`.toLowerCase();
  return haystack.includes(keyword);
}
