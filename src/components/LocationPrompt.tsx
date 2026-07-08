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

// Компактная строка на месте бывшего поиска: до определения города — предложение
// определить его (авто или вручную), после — показывает текущий город с возможностью сменить.
// Всегда одна строка, шрифт и высота как у прежнего поля поиска — не уменьшаются.
export function LocationBar() {
  const { location, status, detectAuto } = useUserLocation();
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm px-4 py-3.5 mb-5">
        <Icon name="MapPin" size={16} className="text-blue-600 flex-shrink-0" />
        {location.city ? (
          <>
            <span className="text-sm text-[hsl(var(--foreground))] flex-1 min-w-0 truncate">
              Рядом с вами: <span className="font-medium">{location.city}</span>
            </span>
            <button
              onClick={() => setManualOpen(true)}
              className="flex-shrink-0 text-xs font-semibold text-[hsl(var(--terra))] hover:underline"
            >
              Изменить
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-[hsl(var(--muted-foreground))] flex-1 min-w-0 truncate">
              Показать организации рядом с вами?
            </span>
            <button
              onClick={() => detectAuto()}
              disabled={status === "locating"}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {status === "locating" ? "Определяем..." : "Определить"}
            </button>
            <button
              onClick={() => setManualOpen(true)}
              className="flex-shrink-0 w-8 h-8 rounded-xl border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:border-blue-300 hover:text-blue-600 transition-colors"
              title="Выбрать город вручную"
            >
              <Icon name="Pencil" size={13} />
            </button>
          </>
        )}
      </div>
      {status === "error" && !location.city && (
        <div className="text-[10px] text-red-600 -mt-4 mb-4">Не удалось определить город автоматически. Выберите вручную.</div>
      )}
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