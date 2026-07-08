import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserLocation } from "@/hooks/useUserLocation";

const DISMISS_KEY = "location_banner_dismissed";

// Баннер на главной — предлагает определить город автоматически или выбрать вручную.
// Показывается один раз, пока пользователь не определит город или явно не закроет баннер.
export function LocationBanner() {
  const { location, status, detectAuto } = useUserLocation();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [manualOpen, setManualOpen] = useState(false);

  if (location.city || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <>
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 animate-slide-up">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <Icon name="MapPin" size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs text-[hsl(var(--foreground))]">Показать организации рядом с вами?</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 mb-2.5">
            Определим ваш город и покажем сначала организации оттуда
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => detectAuto()}
              disabled={status === "locating"}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {status === "locating" ? "Определяем..." : "Определить автоматически"}
            </button>
            <button
              onClick={() => setManualOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Выбрать город
            </button>
          </div>
          {status === "error" && (
            <div className="text-[10px] text-red-600 mt-2">Не удалось определить город автоматически. Попробуйте выбрать вручную.</div>
          )}
        </div>
        <button onClick={dismiss} className="flex-shrink-0 p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <Icon name="X" size={14} />
        </button>
      </div>
      <ManualCityDialog open={manualOpen} onOpenChange={setManualOpen} />
    </>
  );
}

export function ManualCityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { setManualCity, status } = useUserLocation();
  const [query, setQuery] = useState("");

  const submit = async () => {
    if (!query.trim()) return;
    await setManualCity(query.trim());
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Ваш город</DialogTitle>
          <DialogDescription>Мы покажем организации рядом, а если их мало — весь регион</DialogDescription>
        </DialogHeader>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Например, Казань"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30]"
        />
        <button
          onClick={submit}
          disabled={!query.trim() || status === "locating"}
          className="w-full py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {status === "locating" ? "Ищем..." : "Сохранить"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
