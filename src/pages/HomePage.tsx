import Icon from "@/components/ui/icon";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const sections = [
    {
      id: "directory",
      icon: "Users",
      emoji: "🌿",
      title: "Справочник специалистов",
      description: "Психологи, психотерапевты, психиатры и центры помощи рядом с вами",
      color: "bg-[hsl(var(--terra-light))] border-[hsl(var(--terra))/20]",
      iconColor: "text-[hsl(var(--terra))]",
    },
    {
      id: "articles",
      icon: "BookOpen",
      emoji: "📖",
      title: "Полезные материалы",
      description: "Статьи, упражнения и практики для поддержки психического здоровья",
      color: "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))/20]",
      iconColor: "text-[hsl(var(--sage))]",
    },
    {
      id: "emergency",
      icon: "Phone",
      emoji: "🆘",
      title: "Экстренная помощь",
      description: "Горячие линии и кризисная поддержка — доступны круглосуточно",
      color: "bg-[hsl(var(--emergency-light))] border-[hsl(var(--emergency))/20]",
      iconColor: "text-[hsl(var(--emergency))]",
    },
    {
      id: "saved",
      icon: "Heart",
      emoji: "💛",
      title: "Сохранённое",
      description: "Ваши избранные контакты и материалы всегда под рукой",
      color: "bg-[hsl(var(--warm-2))] border-[hsl(var(--terra))/15]",
      iconColor: "text-[hsl(var(--terra))]",
    },
  ];

  const tips = [
    { text: "Попросить о помощи — это сила, а не слабость", icon: "✨" },
    { text: "Ваши чувства важны и заслуживают внимания", icon: "🌸" },
    { text: "Маленький шаг сегодня — это уже прогресс", icon: "🌱" },
  ];

  return (
    <div className="min-h-screen texture-bg animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(32,40%,94%)] via-[hsl(36,33%,97%)] to-[hsl(16,30%,95%)] px-6 pt-12 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[hsl(var(--terra))/6] -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[hsl(var(--sage))/8] translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="relative max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-[hsl(var(--terra))/20] mb-6 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--sage))] animate-pulse" />
            Помощь доступна прямо сейчас
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-medium text-[hsl(var(--foreground))] mb-4 leading-tight">
            Путь к себе
            <span className="block text-[hsl(var(--terra))] italic">начинается здесь</span>
          </h1>

          <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed max-w-sm mx-auto mb-8">
            Найдите специалиста, изучите материалы или позвоните на горячую линию —
            всё в одном месте, безопасно и конфиденциально
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate("directory")}
              className="px-6 py-3 rounded-2xl bg-[hsl(var(--terra))] text-[hsl(var(--primary-foreground))] font-medium text-sm hover:bg-[hsl(16,55%,42%)] transition-colors shadow-sm"
            >
              Найти специалиста
            </button>
            <button
              onClick={() => onNavigate("emergency")}
              className="px-6 py-3 rounded-2xl bg-white/80 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium text-sm hover:bg-white transition-colors"
            >
              🆘 Экстренная помощь
            </button>
          </div>
        </div>
      </div>

      {/* Разделы */}
      <div className="px-4 py-8 max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl text-[hsl(var(--foreground))] mb-5 px-2">Чем могу помочь?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className={`group p-5 rounded-2xl border text-left card-hover animate-slide-up ${s.color}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-2xl mb-3">{s.emoji}</div>
              <div className={`font-semibold text-sm mb-1 ${s.iconColor}`}>{s.title}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{s.description}</div>
            </button>
          ))}
        </div>

        {/* Поддержка */}
        <div className="bg-white/60 border border-[hsl(var(--border))] rounded-2xl p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium mb-4">Помни</p>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
