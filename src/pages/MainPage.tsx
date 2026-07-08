import Icon from "@/components/ui/icon";
import { useSaved } from "@/hooks/useSaved";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const scenarios = [
  {
    icon: "👧",
    label: "Дети и подростки",
    desc: "0–18 лет",
    q: "дети",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
  },
  {
    icon: "👤",
    label: "Взрослые",
    desc: "Психические расстройства, зависимости",
    q: "взрослые",
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
  },
  {
    icon: "👴",
    label: "Пожилые",
    desc: "Помощь пожилым людям",
    q: "пожил",
    color: "bg-amber-50 border-amber-200 hover:border-amber-400",
  },
  {
    icon: "👨‍👩‍👧",
    label: "Семьи и родственники",
    desc: "Помощь близким и опекунам",
    q: "семь",
    color: "bg-violet-50 border-violet-200 hover:border-violet-400",
  },
  {
    icon: "🎓",
    label: "Специалистам",
    desc: "Направление пациента / клиента",
    q: "",
    color: "bg-rose-50 border-rose-200 hover:border-rose-400",
  },
];

export default function MainPage({ onNavigate }: Props) {
  const { total: savedTotal } = useSaved();

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(32,40%,95%)] via-[hsl(36,33%,98%)] to-[hsl(210,30%,97%)] px-4 pt-8 pb-6">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(circle at 80% 20%, hsl(210,60%,85%) 0%, transparent 50%), radial-gradient(circle at 10% 80%, hsl(32,60%,88%) 0%, transparent 50%)"}} />

        <div className="relative max-w-2xl mx-auto">
          {/* Логотип */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--terra))] flex items-center justify-center">
              <Icon name="MapPin" size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[hsl(var(--foreground))] text-sm leading-none">НавигаторПомощи</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-none mt-0.5">Россия</div>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[hsl(var(--foreground))] mb-3 leading-tight">
            Найдите помощь<br />
            <span className="text-[hsl(var(--terra))] italic">рядом с вами</span>
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-6 max-w-sm">
            Справочник организаций для людей с психическими особенностями и их близких.
            Не диагностика — навигация.
          </p>

          {/* Поиск */}
          <div
            className="flex items-center gap-3 bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm px-4 py-3.5 cursor-text mb-5"
            onClick={() => onNavigate("catalog")}
            role="button"
            tabIndex={0}
            aria-label="Поиск организаций"
          >
            <Icon name="Search" size={16} className="text-[hsl(var(--muted-foreground))]" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Поиск по организациям, городу, услугам...</span>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))]">
              <Icon name="MapPin" size={11} />
              Регион
            </div>
          </div>

          {/* Статус */}
          <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Все организации проверены
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Сценарии */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Кому нужна помощь?</h2>
            <button onClick={() => onNavigate("catalog")} className="text-xs text-[hsl(var(--terra))] font-medium hover:underline">
              Все →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {scenarios.map((s) => (
              <button
                key={s.label}
                onClick={() => onNavigate("catalog", { search: s.q })}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 text-left ${s.color}`}
              >
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <div>
                  <div className="font-semibold text-xs text-[hsl(var(--foreground))]">{s.label}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 leading-tight">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Избранное */}
        {savedTotal > 0 && (
          <button
            onClick={() => onNavigate("materials", { tab: "saved" })}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50 hover:border-rose-300 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Icon name="Heart" size={16} className="text-rose-500 fill-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-[hsl(var(--foreground))]">Избранное</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                {savedTotal} сохранено — организации и материалы
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          </button>
        )}

        {/* Предложить организацию */}
        <button
          onClick={() => onNavigate("suggest-org")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--terra))] transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center flex-shrink-0">
            <Icon name="Building2" size={16} className="text-[hsl(var(--terra))]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-[hsl(var(--foreground))]">Вы представитель организации?</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">Предложите её для размещения в каталоге</div>
          </div>
          <Icon name="ChevronRight" size={16} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
        </button>

      </div>
    </div>
  );
}