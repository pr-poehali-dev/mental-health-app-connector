import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { CATEGORY_META, type OrgCategory } from "@/data/types";
import { fetchStats } from "@/api/organizations";

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
  const [stats, setStats] = useState({ total: 0, verified: 0, categories: 0 });

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  const { verified, total, categories: activeCategoryCount } = stats;

  const categories = Object.entries(CATEGORY_META) as [OrgCategory, typeof CATEGORY_META[OrgCategory]][];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(32,40%,95%)] via-[hsl(36,33%,98%)] to-[hsl(210,30%,97%)] px-4 pt-10 pb-8">
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

          {/* Статистика */}
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {verified} проверено
            </span>
            <span>{total || "..."} организаций</span>
            <span>{activeCategoryCount || "..."} категорий</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* ГЛАВНАЯ КНОПКА — Нужна помощь сейчас */}
        <button
          onClick={() => onNavigate("emergency")}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white p-5 text-left shadow-lg shadow-red-200 hover:shadow-red-300 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          aria-label="Нужна помощь сейчас — экстренные контакты"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none">🆘</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-red-100 text-xs font-medium uppercase tracking-wide">Горячие линии • Круглосуточно</span>
            </div>
            <div className="font-bold text-xl mb-0.5">Нужна помощь сейчас</div>
            <div className="text-red-100 text-sm">Экстренные контакты и горячие линии</div>
          </div>
        </button>

        {/* Сценарии */}
        <section>
          <h2 className="font-sans font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Кому нужна помощь?</h2>
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

        {/* Категории */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Категории организаций</h2>
            <button onClick={() => onNavigate("catalog")} className="text-xs text-[hsl(var(--terra))] font-medium hover:underline">
              Все →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(([key, meta]) => (
              <button
                key={key}
                onClick={() => onNavigate("catalog", { category: key })}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 card-hover ${meta.bg}`}
              >
                <span className="text-xl flex-shrink-0">{meta.icon}</span>
                <div className={`font-semibold text-xs ${meta.color}`}>{meta.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Подсказка */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
          <Icon name="Info" size={16} className="text-[hsl(var(--muted-foreground))] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            Этот сервис — <strong>навигатор</strong>, а не медицинский ресурс. Мы помогаем найти организацию,
            которая подходит именно вам. Данные организаций регулярно проверяются.
          </p>
        </div>

      </div>
    </div>
  );
}