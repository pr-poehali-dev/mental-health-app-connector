import Icon from "@/components/ui/icon";
import { organizations } from "@/data/organizations";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const HOTLINES = [
  { name: "Телефон экстренной психологической помощи", number: "8-800-775-17-17", note: "Бесплатно · Круглосуточно", urgent: true, emoji: "🆘" },
  { name: "Детский телефон доверия", number: "8-800-2000-122", note: "Бесплатно · Для детей и подростков · 24/7", urgent: true, emoji: "👦" },
  { name: "Единый номер экстренных служб", number: "112", note: "При угрозе жизни · Психиатрическая скорая", urgent: true, emoji: "🚑" },
  { name: "Горячая линия для родственников", number: "8-800-700-06-16", note: "Бесплатно · Ежедневно 9:00–21:00", urgent: false, emoji: "🤝" },
];

const SCENARIOS = [
  {
    icon: "⚠️",
    title: "Угроза жизни или самоповреждение",
    steps: ["Звоните 112 немедленно", "Не оставляйте человека одного", "Уберите доступ к опасным предметам"],
    color: "bg-red-50 border-red-200",
    accent: "text-red-700",
  },
  {
    icon: "😰",
    title: "Острая паника или психоз",
    steps: ["Говорите спокойно и медленно", "Уберите лишние раздражители", "Позвоните на горячую линию 8-800-775-17-17"],
    color: "bg-orange-50 border-orange-200",
    accent: "text-orange-700",
  },
  {
    icon: "💔",
    title: "Депрессия, ощущение беспомощности",
    steps: ["Вы не одни — позвоните на горячую линию", "Доверьтесь близкому человеку", "Запишитесь к психологу как можно скорее"],
    color: "bg-amber-50 border-amber-200",
    accent: "text-amber-700",
  },
  {
    icon: "👨‍👩‍👧",
    title: "Вы беспокоитесь о близком",
    steps: ["Позвоните на линию для родственников", "Не пытайтесь решить всё в одиночку", "Найдите специалиста через наш каталог"],
    color: "bg-blue-50 border-blue-200",
    accent: "text-blue-700",
  },
];

export default function EmergencyHelpPage({ onNavigate }: Props) {
  const urgentOrgs = organizations.filter((o) => o.isUrgent);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Главный баннер */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 px-4 pt-10 pb-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, white 0%, transparent 70%)" }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-red-200 text-xs font-medium uppercase tracking-wide">Горячие линии</span>
          </div>
          <h1 className="font-serif text-3xl font-medium mb-2">Вам нужна помощь прямо сейчас</h1>
          <p className="text-red-100 text-sm leading-relaxed mb-6 max-w-sm">
            Специалисты работают <strong>бесплатно</strong> и <strong>анонимно</strong>. Позвоните — это важно.
          </p>

          {/* Главный звонок */}
          <a
            href="tel:88007751717"
            className="block w-full bg-white rounded-2xl p-4 text-center shadow-xl hover:scale-[1.01] transition-transform active:scale-[0.99]"
          >
            <div className="font-bold text-2xl text-red-600 mb-0.5">8-800-775-17-17</div>
            <div className="text-sm text-gray-500">Телефон доверия · Бесплатно · 24/7</div>
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Все горячие линии */}
        <section>
          <h2 className="font-sans font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Все горячие линии</h2>
          <div className="space-y-2">
            {HOTLINES.map((h, i) => (
              <div key={i} className={`rounded-2xl border p-4 ${h.urgent ? "bg-red-50 border-red-200" : "bg-white border-[hsl(var(--border))]"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">{h.name}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">{h.note}</div>
                    <a
                      href={`tel:${h.number.replace(/[\s-]/g, "")}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        h.urgent ? "bg-red-500 text-white hover:bg-red-600" : "bg-[hsl(var(--terra))] text-white hover:bg-[hsl(16,55%,42%)]"
                      }`}
                    >
                      <Icon name="Phone" size={12} />
                      {h.number}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Сценарии */}
        <section>
          <h2 className="font-sans font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Что делать в разных ситуациях</h2>
          <div className="space-y-2.5">
            {SCENARIOS.map((s, i) => (
              <div key={i} className={`rounded-2xl border p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <h3 className={`font-semibold text-sm ${s.accent}`}>{s.title}</h3>
                </div>
                <ol className="space-y-1.5">
                  {s.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.accent} bg-white`}>
                        {j + 1}
                      </span>
                      <span className="text-xs text-[hsl(var(--foreground))] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Организации с круглосуточной помощью */}
        {urgentOrgs.length > 0 && (
          <section>
            <h2 className="font-sans font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Организации с экстренной помощью</h2>
            <div className="space-y-2">
              {urgentOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onNavigate("org", { id: org.id })}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-[hsl(var(--border))] text-left card-hover"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] truncate">{org.shortName || org.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">{org.simpleDescription}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {org.phone && (
                      <a
                        href={`tel:${org.phone.replace(/[\s\-()]/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        aria-label="Позвонить"
                      >
                        <Icon name="Phone" size={14} />
                      </a>
                    )}
                    <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Важное напоминание */}
        <div className="p-5 rounded-2xl bg-[hsl(var(--terra-light))] border border-[hsl(var(--terra))/25]">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💙</span>
            <div>
              <p className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">Обратиться за помощью — это смелость</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                Каждый может оказаться в кризисе. Горячие линии работают <strong>анонимно</strong> —
                никто не узнает, что вы звонили. Специалисты на линии обучены именно для того, чтобы помогать.
              </p>
            </div>
          </div>
        </div>

        {/* Поиск специалиста */}
        <button
          onClick={() => onNavigate("catalog")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[hsl(var(--terra))/40] text-[hsl(var(--terra))] text-sm font-semibold hover:bg-[hsl(var(--terra-light))] transition-colors"
        >
          <Icon name="Search" size={15} />
          Найти специалиста или организацию
        </button>

      </div>
    </div>
  );
}