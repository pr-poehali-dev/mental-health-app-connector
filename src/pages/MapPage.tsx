import { useState } from "react";
import Icon from "@/components/ui/icon";
import { organizations } from "@/data/organizations";
import { CATEGORY_META, type OrgCategory } from "@/data/types";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

// Координаты городов для позиционирования на схематической карте
const CITY_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  "Москва": { x: 52, y: 38, label: "Москва" },
  "Санкт-Петербург": { x: 44, y: 20, label: "СПб" },
  "Казань": { x: 62, y: 37, label: "Казань" },
  "Новосибирск": { x: 78, y: 40, label: "Новосибирск" },
  "Вся Россия": { x: 50, y: 12, label: "🌍 Вся Россия" },
};

export default function MapPage({ onNavigate }: Props) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredOrg, setHoveredOrg] = useState<string | null>(null);

  const withCoords = organizations.filter((o) => o.city in CITY_POSITIONS);

  const cityGroups = withCoords.reduce<Record<string, typeof withCoords>>((acc, org) => {
    const key = org.city;
    acc[key] = acc[key] || [];
    acc[key].push(org);
    return acc;
  }, {});

  const cityList = Object.keys(cityGroups);
  const selectedOrgs = selectedCity ? cityGroups[selectedCity] || [] : [];

  return (
    <div className="min-h-screen animate-fade-in flex flex-col">
      {/* Шапка */}
      <div className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl font-medium text-[hsl(var(--foreground))] mb-0.5">Карта организаций</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Нажмите на город, чтобы увидеть организации</p>
        </div>
      </div>

      {/* Схематическая карта России */}
      <div className="max-w-2xl mx-auto w-full px-4 py-4">
        <div className="relative bg-gradient-to-br from-[hsl(210,30%,96%)] to-[hsl(210,20%,92%)] rounded-2xl border border-[hsl(var(--border))] overflow-hidden"
          style={{ height: 280 }}>

          {/* Контур России (упрощённый SVG) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
            {/* Условная территория */}
            <path
              d="M 10 25 Q 15 15 25 18 Q 35 12 45 15 Q 55 10 65 14 Q 75 12 85 18 Q 92 22 90 35 Q 88 48 80 50 Q 70 55 60 52 Q 48 55 38 50 Q 28 48 20 43 Q 12 38 10 25 Z"
              fill="hsl(210,25%,88%)"
              stroke="hsl(210,25%,78%)"
              strokeWidth="0.5"
            />
            {/* Метка "Россия" */}
            <text x="50" y="36" textAnchor="middle" fill="hsl(210,25%,65%)" fontSize="4" fontFamily="sans-serif">РОССИЯ</text>
          </svg>

          {/* Точки городов */}
          {cityList.map((city) => {
            const pos = CITY_POSITIONS[city];
            if (!pos) return null;
            const count = cityGroups[city].length;
            const isSelected = selectedCity === city;

            return (
              <button
                key={city}
                onClick={() => setSelectedCity(isSelected ? null : city)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                aria-label={`${city}: ${count} организаций`}
              >
                <div className={`relative flex items-center justify-center rounded-full transition-all duration-200 shadow-md ${
                  isSelected
                    ? "w-10 h-10 bg-[hsl(var(--terra))] scale-110"
                    : "w-8 h-8 bg-white border-2 border-[hsl(var(--terra))] hover:scale-110"
                }`}>
                  <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-[hsl(var(--terra))]"}`}>
                    {count}
                  </span>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-[hsl(var(--foreground))] bg-white/80 px-1 rounded">
                  {pos.label}
                </div>
              </button>
            );
          })}

          {/* Легенда */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            {(Object.entries(CATEGORY_META) as [OrgCategory, typeof CATEGORY_META[OrgCategory]][]).slice(0, 4).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-xs">{meta.icon}</span>
                <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{meta.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Выбор города */}
        <div className="mt-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 font-medium">Выберите регион:</p>
          <div className="flex flex-wrap gap-2">
            {cityList.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  selectedCity === city
                    ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                    : "bg-white border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--terra))/50]"
                }`}
              >
                {city} ({cityGroups[city].length})
              </button>
            ))}
          </div>
        </div>

        {/* Список организаций для выбранного города */}
        {selectedCity && (
          <div className="mt-5 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-[hsl(var(--foreground))]">
                {selectedCity} — {selectedOrgs.length} {selectedOrgs.length === 1 ? "организация" : selectedOrgs.length < 5 ? "организации" : "организаций"}
              </h2>
              <button
                onClick={() => onNavigate("catalog", { region: selectedCity })}
                className="text-xs text-[hsl(var(--terra))] hover:underline font-medium"
              >
                Все в каталоге →
              </button>
            </div>
            <div className="space-y-2">
              {selectedOrgs.map((org) => {
                const cat = CATEGORY_META[org.category];
                return (
                  <button
                    key={org.id}
                    onClick={() => onNavigate("org", { id: org.id })}
                    onMouseEnter={() => setHoveredOrg(org.id)}
                    onMouseLeave={() => setHoveredOrg(null)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      hoveredOrg === org.id
                        ? "border-[hsl(var(--terra))/40] bg-[hsl(var(--terra-light))]"
                        : "border-[hsl(var(--border))] bg-white"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cat.bg}`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{org.shortName || org.name}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{cat.label}</div>
                    </div>
                    {org.isUrgent && (
                      <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">24/7</span>
                    )}
                    <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!selectedCity && (
          <div className="mt-6 text-center py-8">
            <div className="text-3xl mb-2">🗺</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Выберите город на карте или в списке выше</p>
          </div>
        )}
      </div>
    </div>
  );
}
