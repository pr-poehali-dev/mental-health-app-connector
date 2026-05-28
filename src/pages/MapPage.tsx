import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchOrganizations, type DbOrganization } from "@/api/organizations";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

function normalizeCity(raw: string | null): string {
  if (!raw) return "Не указано";
  return raw
    .replace(/^г\.\s*/i, "")
    .replace(/^с\.\s*/i, "с. ")
    .replace(/^пгт\.\s*/i, "пгт. ")
    .trim();
}

export default function MapPage({ onNavigate }: Props) {
  const [orgs, setOrgs] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrganizations().then((data) => {
      setOrgs(data);
      setLoading(false);
    });
  }, []);

  const cityGroups = orgs.reduce<Record<string, DbOrganization[]>>((acc, org) => {
    const city = normalizeCity(org.city);
    acc[city] = acc[city] || [];
    acc[city].push(org);
    return acc;
  }, {});

  const cityList = Object.keys(cityGroups).sort((a, b) => {
    const diff = cityGroups[b].length - cityGroups[a].length;
    return diff !== 0 ? diff : a.localeCompare(b, "ru");
  });

  const filteredCities = search
    ? cityList.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : cityList;

  const selectedOrgs = selectedCity ? cityGroups[selectedCity] || [] : [];

  return (
    <div className="min-h-screen animate-fade-in flex flex-col">
      <div className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-2xl font-medium text-[hsl(var(--foreground))] mb-0.5">Карта организаций</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {loading ? "Загрузка..." : `${orgs.length} организаций в ${cityList.length} населённых пунктах`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4">

        {/* Поиск по городу */}
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            placeholder="Поиск по городу..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedCity(null); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
          />
        </div>

        {/* Сетка городов */}
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredCities.map((city) => {
              const count = cityGroups[city].length;
              const isSelected = selectedCity === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(isSelected ? null : city)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-[hsl(var(--terra))] border-[hsl(var(--terra))] text-white"
                      : "bg-white border-[hsl(var(--border))] hover:border-[hsl(var(--terra))/50]"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                    isSelected ? "bg-white/20" : "bg-[hsl(var(--muted))]"
                  }`}>
                    {city.startsWith("с.") ? "🏘" : city.startsWith("пгт.") ? "🏘" : "🏙"}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-xs truncate ${isSelected ? "text-white" : "text-[hsl(var(--foreground))]"}`}>
                      {city}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-[hsl(var(--muted-foreground))]"}`}>
                      {count} {count === 1 ? "организация" : count < 5 ? "организации" : "организаций"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && filteredCities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Город не найден</p>
          </div>
        )}

        {/* Список организаций выбранного города */}
        {selectedCity && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-[hsl(var(--foreground))]">
                {selectedCity} — {selectedOrgs.length} {selectedOrgs.length === 1 ? "организация" : selectedOrgs.length < 5 ? "организации" : "организаций"}
              </h2>
              <button
                onClick={() => onNavigate("catalog", { search: selectedCity })}
                className="text-xs text-[hsl(var(--terra))] hover:underline font-medium"
              >
                В каталоге →
              </button>
            </div>
            <div className="space-y-2">
              {selectedOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onNavigate("org", { id: String(org.id) })}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[hsl(var(--border))] bg-white text-left hover:border-[hsl(var(--terra))/40] hover:bg-[hsl(var(--terra-light))] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[hsl(var(--muted))]">
                    🏥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{org.name}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate">{org.category ?? org.org_type}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!selectedCity && !loading && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🗺</div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Выберите населённый пункт, чтобы увидеть организации</p>
          </div>
        )}

      </div>
    </div>
  );
}
