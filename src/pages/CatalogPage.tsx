import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  CATEGORY_META,
  AGE_META,
  NEED_META,
  SERVICE_META,
  PAYMENT_META,
  REGIONS,
  type OrgCategory,
  type AgeGroup,
  type SpecialNeed,
  type ServiceType,
  type PaymentType,
} from "@/data/types";
import { fetchOrganizations, type DbOrganization } from "@/api/organizations";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialCategory?: string;
  initialSearch?: string;
}

interface Filters {
  search: string;
  region: string;
  categories: OrgCategory[];
  ageGroups: AgeGroup[];
  specialNeeds: SpecialNeed[];
  serviceTypes: ServiceType[];
  paymentTypes: PaymentType[];
}

const verStatusColor: Record<string, string> = {
  verified: "text-emerald-700 bg-emerald-50",
  pending: "text-amber-700 bg-amber-50",
  outdated: "text-red-700 bg-red-50",
};
const verStatusLabel: Record<string, string> = {
  verified: "Проверено",
  pending: "На проверке",
  outdated: "Устарело",
};

function DbOrgCard({ org, onSelect }: { org: DbOrganization; onSelect: () => void }) {
  const categoryKey = org.category?.toLowerCase().includes("медицин") ? "healthcare"
    : org.category?.toLowerCase().includes("нко") || org.category?.toLowerCase().includes("некоммерч") ? "nko"
    : org.category?.toLowerCase().includes("соц") ? "social"
    : org.category?.toLowerCase().includes("образов") ? "education"
    : org.category?.toLowerCase().includes("кризис") ? "crisis"
    : "social";
  const cat = CATEGORY_META[categoryKey as keyof typeof CATEGORY_META] ?? CATEGORY_META.social;

  const tags = org.target_group ? org.target_group.split(";").map(s => s.trim()).filter(Boolean).slice(0, 3) : [];

  return (
    <button
      onClick={onSelect}
      className="w-full bg-white rounded-2xl border border-[hsl(var(--border))] p-4 text-left card-hover animate-slide-up"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat.bg}`}>
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[hsl(var(--foreground))] leading-snug">{org.name}</div>
          <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.bg} ${cat.color}`}>
            {org.category ?? cat.label}
          </span>
        </div>
      </div>

      {org.short_description && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3 line-clamp-2">
          {org.short_description}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {org.city && (
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <Icon name="MapPin" size={10} />
              {org.city}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {org.verification_status && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${verStatusColor[org.verification_status] ?? ""}`}>
              {verStatusLabel[org.verification_status] ?? org.verification_status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function CatalogPage({ onNavigate, initialCategory, initialSearch }: Props) {
  const [allOrgs, setAllOrgs] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: initialSearch ?? "",
    region: "Вся Россия",
    categories: initialCategory ? [initialCategory as OrgCategory] : [],
    ageGroups: [],
    specialNeeds: [],
    serviceTypes: [],
    paymentTypes: [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "updated">("name");

  useEffect(() => {
    fetchOrganizations().then((data) => {
      setAllOrgs(data);
      setLoading(false);
    });
  }, []);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const filtered = useMemo(() => {
    let list = [...allOrgs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.short_description ?? "").toLowerCase().includes(q) ||
          (o.city ?? "").toLowerCase().includes(q) ||
          (o.target_group ?? "").toLowerCase().includes(q) ||
          (o.help_types ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.region !== "Вся Россия") {
      list = list.filter((o) => (o.city ?? "").toLowerCase().includes(filters.region.toLowerCase()));
    }
    if (filters.categories.length) {
      list = list.filter((o) => {
        const cat = (o.category ?? "").toLowerCase();
        return filters.categories.some((c) => {
          if (c === "healthcare") return cat.includes("медицин");
          if (c === "nko") return cat.includes("нко") || cat.includes("некоммерч");
          if (c === "social") return cat.includes("соц");
          if (c === "education") return cat.includes("образов");
          if (c === "crisis") return cat.includes("кризис");
          return false;
        });
      });
    }

    if (sortBy === "updated")
      list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    else list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [allOrgs, filters, sortBy]);

  const activeFiltersCount =
    filters.categories.length +
    filters.ageGroups.length +
    filters.specialNeeds.length +
    filters.serviceTypes.length +
    filters.paymentTypes.length +
    (filters.region !== "Вся Россия" ? 1 : 0);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Поиск-шапка */}
      <div className="sticky top-0 z-20 bg-[hsl(var(--background))]/95 backdrop-blur-sm border-b border-[hsl(var(--border))] px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2.5">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="search"
              placeholder="Поиск по названию, городу, услуге..."
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Регион */}
            <select
              value={filters.region}
              onChange={(e) => setFilter("region", e.target.value)}
              className="flex-1 px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] text-xs bg-white text-[hsl(var(--foreground))] focus:outline-none"
            >
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>

            {/* Все фильтры */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                activeFiltersCount > 0 || filtersOpen
                  ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                  : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              <Icon name="SlidersHorizontal" size={13} />
              Фильтры{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </button>

            {/* Сортировка */}
            <button
              onClick={() => setSortBy(sortBy === "name" ? "updated" : "name")}
              className="px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
              title="Сортировка"
            >
              <Icon name="ArrowUpDown" size={13} />
            </button>

            {/* Карта */}
            <button
              onClick={() => onNavigate("map")}
              className="px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
              title="На карте"
            >
              <Icon name="Map" size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      {filtersOpen && (
        <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] px-4 py-4 animate-slide-up">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Категории */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Категория</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(CATEGORY_META) as [OrgCategory, typeof CATEGORY_META[OrgCategory]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("categories", toggleArr(filters.categories, key))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filters.categories.includes(key)
                        ? `${meta.bg} ${meta.color} border-current`
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Возраст */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Для кого</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(AGE_META) as [AgeGroup, typeof AGE_META[AgeGroup]][]).filter(([k]) => k !== "all").map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("ageGroups", toggleArr(filters.ageGroups, key))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filters.ageGroups.includes(key)
                        ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Нарушения */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Особенности</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(NEED_META) as [SpecialNeed, typeof NEED_META[SpecialNeed]][]).filter(([k]) => k !== "any").map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("specialNeeds", toggleArr(filters.specialNeeds, key))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filters.specialNeeds.includes(key)
                        ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {meta.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Формат */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Формат помощи</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(SERVICE_META) as [ServiceType, typeof SERVICE_META[ServiceType]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("serviceTypes", toggleArr(filters.serviceTypes, key))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filters.serviceTypes.includes(key)
                        ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Оплата */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Оплата</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(PAYMENT_META) as [PaymentType, typeof PAYMENT_META[PaymentType]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("paymentTypes", toggleArr(filters.paymentTypes, key))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filters.paymentTypes.includes(key)
                        ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => setFilters({ search: filters.search, region: "Вся Россия", categories: [], ageGroups: [], specialNeeds: [], serviceTypes: [], paymentTypes: [] })}
                className="text-xs text-[hsl(var(--terra))] hover:underline font-medium"
              >
                Сбросить все фильтры
              </button>
            )}
          </div>
        </div>
      )}

      {/* Список */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {loading ? "Загрузка..." : <>Найдено: <span className="font-semibold text-[hsl(var(--foreground))]">{filtered.length}</span></>}
          </p>
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.categories.map((c) => (
                <span key={c} className="px-1.5 py-0.5 rounded bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] text-[10px] font-medium">
                  {CATEGORY_META[c].label} ×
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((org, i) => (
              <div key={org.id} style={{ animationDelay: `${i * 40}ms` }}>
                <DbOrgCard org={org} onSelect={() => onNavigate("org", { id: String(org.id) })} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-[hsl(var(--foreground))]">Ничего не найдено</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-4">Попробуйте изменить фильтры или регион</p>
            <button
              onClick={() => setFilters({ search: "", region: "Вся Россия", categories: [], ageGroups: [], specialNeeds: [], serviceTypes: [], paymentTypes: [] })}
              className="text-sm text-[hsl(var(--terra))] font-medium hover:underline"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}