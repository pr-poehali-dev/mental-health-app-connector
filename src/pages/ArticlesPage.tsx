import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Article {
  id: number;
  title: string;
  category: string;
  emoji: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  color: string;
  saved: boolean;
}

const articlesData: Article[] = [
  {
    id: 1,
    title: "Как распознать тревогу и что с ней делать",
    category: "Тревога",
    emoji: "🌊",
    readTime: "7 мин",
    excerpt: "Тревога — это нормальная реакция организма. Но иногда она становится слишком интенсивной. Разбираемся, как отличить полезную тревогу от проблемной.",
    tags: ["Тревога", "Самопомощь", "КПТ"],
    color: "from-blue-50 to-sky-50",
    saved: false,
  },
  {
    id: 2,
    title: "Техники дыхания для быстрого успокоения",
    category: "Практики",
    emoji: "🌬",
    readTime: "5 мин",
    excerpt: "Дыхание — один из самых быстрых способов успокоить нервную систему. 4 техники, которые работают даже в острый момент стресса.",
    tags: ["Дыхание", "Стресс", "Практика"],
    color: "from-green-50 to-emerald-50",
    saved: false,
  },
  {
    id: 3,
    title: "Депрессия: симптомы, которые мы не замечаем",
    category: "Депрессия",
    emoji: "🌧",
    readTime: "10 мин",
    excerpt: "Депрессия не всегда выглядит как грусть. Иногда это раздражительность, усталость или потеря интереса. Как распознать её вовремя.",
    tags: ["Депрессия", "Симптомы", "Диагностика"],
    color: "from-purple-50 to-violet-50",
    saved: false,
  },
  {
    id: 4,
    title: "Как говорить о своих чувствах: руководство",
    category: "Коммуникация",
    emoji: "💬",
    readTime: "8 мин",
    excerpt: "Многие из нас не умеют говорить о том, что чувствуем. Простые техники, которые помогут донести свои эмоции до близких.",
    tags: ["Эмоции", "Отношения", "Общение"],
    color: "from-orange-50 to-amber-50",
    saved: false,
  },
  {
    id: 5,
    title: "Сон и психическое здоровье: всё связано",
    category: "Здоровый сон",
    emoji: "🌙",
    readTime: "6 мин",
    excerpt: "Нарушения сна и психические расстройства тесно связаны. Рассказываем, как наладить режим и почему это важно.",
    tags: ["Сон", "Режим", "Здоровье"],
    color: "from-indigo-50 to-blue-50",
    saved: false,
  },
  {
    id: 6,
    title: "Медитация для начинающих: первые шаги",
    category: "Практики",
    emoji: "🧘",
    readTime: "9 мин",
    excerpt: "Медитация — не мистика. Это практика осознанности, которую можно освоить за несколько недель. Начнём с малого.",
    tags: ["Медитация", "Осознанность", "Начало"],
    color: "from-teal-50 to-green-50",
    saved: false,
  },
];

const categories = ["Все", "Тревога", "Практики", "Депрессия", "Коммуникация", "Здоровый сон"];

export default function ArticlesPage() {
  const [articles, setArticles] = useState(articlesData);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeCategory === "Все"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const toggleSave = (id: number) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, saved: !a.saved } : a))
    );
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className="bg-gradient-to-b from-[hsl(var(--sage-light))] to-[hsl(var(--background))] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl font-medium text-[hsl(var(--foreground))] mb-1">Материалы</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">Статьи и практики для заботы о себе</p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[hsl(var(--sage))] text-white"
                    : "bg-white border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Карточки */}
        <div className="space-y-3">
          {filtered.map((article, i) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden card-hover animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`bg-gradient-to-r ${article.color} px-5 pt-5 pb-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-3xl">{article.emoji}</div>
                  <button
                    onClick={() => toggleSave(article.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      article.saved
                        ? "bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))]"
                        : "bg-white/60 text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    <Icon name="Bookmark" size={14} />
                  </button>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{article.category}</span>
                  <h3 className="font-serif text-lg font-medium text-[hsl(var(--foreground))] mt-0.5 leading-snug">{article.title}</h3>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                  {expandedId === article.id ? article.excerpt + " Это лишь краткое введение — полная статья поможет разобраться в теме глубже и найти подходящие инструменты именно для вас." : article.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {article.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))]">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Icon name="Clock" size={11} />
                    {article.readTime}
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                    className="text-xs font-medium text-[hsl(var(--terra))] hover:underline"
                  >
                    {expandedId === article.id ? "Свернуть" : "Читать →"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Баннер про помощь */}
        <div className="mt-6 p-5 rounded-2xl bg-[hsl(var(--terra-light))] border border-[hsl(var(--terra))/20]">
          <div className="text-2xl mb-2">💙</div>
          <p className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">Нужна живая поддержка?</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            Статьи — хорошее начало, но иногда важна живая беседа со специалистом.
            Не откладывайте обращение за помощью.
          </p>
        </div>
      </div>
    </div>
  );
}
