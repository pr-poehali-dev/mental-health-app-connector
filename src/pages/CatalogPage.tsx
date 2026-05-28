import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  CATEGORY_META,
  AGE_META,
  NEED_META,
  SERVICE_META,
  PAYMENT_META,
  REGIONS,
  dbCategoryToKey,
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
  const cat = CATEGORY_META[dbCategoryToKey(org.category, org.name)];
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
        {org.city && (
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Icon name="MapPin" size={10} />
            {org.city}
          </span>
        )}
        {org.verification_status && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${verStatusColor[org.verification_status] ?? ""}`}>
            {verStatusLabel[org.verification_status] ?? org.verification_status}
          </span>
        )}
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
      const q = filters.search.toLowerCase().trim();
      const SYNONYMS: Record<string, string[]> = {
        "нко": ["некоммерческий", "благотворит", "автономн", "общественн", "ано ", "фонд"],
        "ано": ["автономная некоммерческая", "некоммерческий"],
        "некоммерческий": ["нко", "благотворит", "автономн", "общественн", "ано "],
        "благотворит": ["нко", "некоммерческий", "фонд"],
        "соцзащита": ["социального обслуживания", "социальн"],
        "психиатр": ["психическ", "психоневрол"],
        "наркол": ["зависим", "алкогол"],
        "реабилитац": ["абилитац", "восстановлен"],
      };
      const extraTerms = Object.entries(SYNONYMS)
        .filter(([key]) => q.includes(key))
        .flatMap(([, vals]) => vals);
      const terms = [q, ...extraTerms];
      list = list.filter((o) => {
        const haystack = [o.name, o.short_description ?? "", o.city ?? "", o.target_group ?? "", o.help_types ?? "", o.category ?? "", o.org_type ?? ""].join(" ").toLowerCase();
        return terms.some((t) => haystack.includes(t));
      });
    }

    if (filters.region !== "Вся Россия") {
      list = list.filter((o) => (o.city ?? "").toLowerCase().includes(filters.region.toLowerCase()));
    }
    if (filters.categories.length) {
      list = list.filter((o) => filters.categories.includes(dbCategoryToKey(o.category, o.name)));
    }

    if (sortBy === "updated") list.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    else list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [allOrgs, filters, sortBy]);

  const activeFiltersCount =
    filters.ageGroups.length +
    filters.specialNeeds.length +
    filters.serviceTypes.length +
    filters.paymentTypes.length +
    (filters.region !== "Вся Россия" ? 1 : 0);

  const categories = Object.entries(CATEGORY_META) as [OrgCategory, typeof CATEGORY_META[OrgCategory]][];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка — прилипает к верху */}
      <div className="sticky top-[53px] z-20 bg-[hsl(var(--background))]/95 backdrop-blur-sm border-b border-[hsl(var(--border))] px-4 pt-3 pb-3">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* Строка поиска + кнопки */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("home")}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
              title="На главную"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="relative flex-1">
              <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                type="search"
                placeholder="Поиск по названию, городу, услуге..."
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
                autoComplete="off"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`relative flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border transition-colors ${
                activeFiltersCount > 0 || filtersOpen
                  ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                  : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              }`}
              title="Дополнительные фильтры"
            >
              <Icon name="SlidersHorizontal" size={16} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--terra))] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate("map")}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
              title="На карте"
            >
              <Icon name="Map" size={16} />
            </button>
          </div>

          {/* Категории — всегда видны */}
          <div>
            <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Категория</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("categories", [])}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  filters.categories.length === 0
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]"
                    : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground))/40]"
                }`}
              >
                Все
              </button>
              {categories.map(([key, meta]) => {
                const active = filters.categories.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => setFilter("categories", toggleArr(filters.categories, key))}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      active
                        ? `${meta.bg} ${meta.color} border-current shadow-sm`
                        : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground))/30]"
                    }`}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Панель доп. фильтров (регион, возраст и т.д.) */}
      {filtersOpen && (
        <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] px-4 py-4 animate-slide-up">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Регион */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Регион</p>
              <select
                value={filters.region}
                onChange={(e) => setFilter("region", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm bg-white text-[hsl(var(--foreground))] focus:outline-none"
              >
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Возраст */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Для кого</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(AGE_META) as [AgeGroup, typeof AGE_META[AgeGroup]][]).filter(([k]) => k !== "all").map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("ageGroups", toggleArr(filters.ageGroups, key))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
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

            {/* Формат */}
            <div>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Формат помощи</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(SERVICE_META) as [ServiceType, typeof SERVICE_META[ServiceType]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setFilter("serviceTypes", toggleArr(filters.serviceTypes, key))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
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
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
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

            {(activeFiltersCount > 0 || filters.categories.length > 0) && (
              <button
                onClick={() => setFilters({ search: filters.search, region: "Вся Россия", categories: [], ageGroups: [], specialNeeds: [], serviceTypes: [], paymentTypes: [] })}
                className="text-sm text-[hsl(var(--terra))] hover:underline font-medium"
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
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {loading ? "Загрузка..." : <>Найдено: <span className="font-semibold text-[hsl(var(--foreground))]">{filtered.length}</span></>}
          </p>
          <div className="flex items-center gap-2">
            {filters.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter("categories", toggleArr(filters.categories, c))}
                    className="px-2 py-0.5 rounded-full bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] text-xs font-medium hover:bg-[hsl(var(--terra))/20]"
                  >
                    {CATEGORY_META[c].icon} {CATEGORY_META[c].label} ×
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setSortBy(sortBy === "name" ? "updated" : "name")}
              className="p-1.5 rounded-lg border border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
              title={sortBy === "name" ? "По алфавиту" : "По дате"}
            >
              <Icon name="ArrowUpDown" size={13} />
            </button>
          </div>
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