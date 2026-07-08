import { useState, useEffect, useCallback } from "react";

const KEY = "saved_items";
const EVENT = "saved_items_changed";

export interface SavedItems {
  orgs: number[];
  materials: number[];
}

function load(): SavedItems {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { orgs: parsed.orgs ?? [], materials: parsed.materials ?? [] };
  } catch {
    return { orgs: [], materials: [] };
  }
}

function persist(data: SavedItems) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

// Общий хук избранного — организации и материалы.
// Синхронизируется между всеми компонентами через кастомное событие,
// чтобы счётчик в навигации обновлялся мгновенно при изменении в любом месте.
export function useSaved() {
  const [saved, setSaved] = useState<SavedItems>(load);

  useEffect(() => {
    const handler = () => setSaved(load());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleOrg = useCallback((id: number) => {
    const current = load();
    const orgs = current.orgs.includes(id) ? current.orgs.filter((x) => x !== id) : [...current.orgs, id];
    persist({ ...current, orgs });
  }, []);

  const toggleMaterial = useCallback((id: number) => {
    const current = load();
    const materials = current.materials.includes(id) ? current.materials.filter((x) => x !== id) : [...current.materials, id];
    persist({ ...current, materials });
  }, []);

  const isSaved = useCallback((id: number) => saved.orgs.includes(id), [saved]);
  const isSavedMaterial = useCallback((id: number) => saved.materials.includes(id), [saved]);

  return {
    saved,
    toggleOrg,
    toggleMaterial,
    isSaved,
    isSavedMaterial,
    total: saved.orgs.length + saved.materials.length,
  };
}
