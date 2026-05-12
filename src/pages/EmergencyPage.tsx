import Icon from "@/components/ui/icon";

const hotlines = [
  {
    name: "Телефон доверия (МЧС)",
    number: "8-800-775-17-17",
    description: "Психологическая помощь, бесплатно, круглосуточно",
    available: "24/7",
    free: true,
    emoji: "🆘",
    color: "bg-red-50 border-red-200",
    btnColor: "bg-red-500 hover:bg-red-600",
  },
  {
    name: "Детский телефон доверия",
    number: "8-800-2000-122",
    description: "Для детей и подростков, бесплатно по всей России",
    available: "24/7",
    free: true,
    emoji: "👦",
    color: "bg-orange-50 border-orange-200",
    btnColor: "bg-orange-500 hover:bg-orange-600",
  },
  {
    name: "Скорая психиатрическая помощь",
    number: "112",
    description: "Вызов в случае острого психотического эпизода или угрозы жизни",
    available: "24/7",
    free: true,
    emoji: "🚑",
    color: "bg-red-50 border-red-200",
    btnColor: "bg-red-600 hover:bg-red-700",
  },
  {
    name: "Московская служба психологической помощи",
    number: "+7 (495) 051",
    description: "Для жителей Москвы. Бесплатная психологическая поддержка",
    available: "Пн–Пт, 9:00–21:00",
    free: true,
    emoji: "🌆",
    color: "bg-[hsl(var(--terra-light))] border-[hsl(var(--terra))/30]",
    btnColor: "bg-[hsl(var(--terra))] hover:bg-[hsl(16,55%,42%)]",
  },
  {
    name: "Телефон доверия для взрослых",
    number: "8-800-2000-122",
    description: "Анонимная бесплатная психологическая помощь для взрослых",
    available: "24/7",
    free: true,
    emoji: "🤝",
    color: "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))/30]",
    btnColor: "bg-[hsl(var(--sage))] hover:bg-[hsl(145,18%,45%)]",
  },
  {
    name: "Психологическая помощь онлайн",
    number: "+7 (800) 250-55-25",
    description: "Онлайн-чат и телефонная поддержка, частично бесплатно",
    available: "Пн–Пт, 8:00–22:00",
    free: false,
    emoji: "💬",
    color: "bg-blue-50 border-blue-200",
    btnColor: "bg-blue-500 hover:bg-blue-600",
  },
];

const steps = [
  { step: "1", title: "Позвоните на горячую линию", desc: "Это анонимно и бесплатно. Специалист поможет справиться с острым моментом." },
  { step: "2", title: "Обратитесь к близким", desc: "Расскажите кому-то, кому доверяете. Не оставайтесь с кризисом наедине." },
  { step: "3", title: "Обратитесь к специалисту", desc: "После кризисного момента запишитесь к психологу или психотерапевту." },
];

export default function EmergencyPage() {
  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка — акцентная */}
      <div className="bg-gradient-to-b from-red-50 via-orange-50 to-[hsl(var(--background))] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200 mb-4 text-xs font-medium text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Экстренная помощь
          </div>
          <h1 className="font-serif text-3xl font-medium text-[hsl(var(--foreground))] mb-2">Вы не одни</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
            Если вам плохо прямо сейчас — позвоните. Специалисты работают бесплатно и анонимно, круглосуточно.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Главная кнопка */}
        <a
          href="tel:88007751717"
          className="block w-full p-5 rounded-2xl bg-red-500 text-white text-center mb-6 hover:bg-red-600 transition-colors shadow-lg shadow-red-200 animate-slide-up"
        >
          <div className="text-2xl mb-1">📞</div>
          <div className="font-bold text-xl mb-0.5">8-800-775-17-17</div>
          <div className="text-red-100 text-sm">Единый телефон доверия · Бесплатно · 24/7</div>
        </a>

        {/* Горячие линии */}
        <h2 className="font-serif text-xl font-medium text-[hsl(var(--foreground))] mb-4">Все горячие линии</h2>
        <div className="space-y-3 mb-8">
          {hotlines.map((line, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 animate-slide-up ${line.color}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{line.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))]">{line.name}</div>
                    {line.free && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                        Бесплатно
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 leading-relaxed">{line.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                      <Icon name="Clock" size={10} />
                      {line.available}
                    </span>
                    <a
                      href={`tel:${line.number.replace(/[\s\-()]/g, "")}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${line.btnColor}`}
                    >
                      <Icon name="Phone" size={11} />
                      {line.number}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Что делать */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 mb-6">
          <h3 className="font-serif text-lg font-medium text-[hsl(var(--foreground))] mb-4">Что делать в кризис</h3>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[hsl(var(--foreground))] mb-0.5">{step.title}</div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Напоминание */}
        <div className="p-5 rounded-2xl bg-[hsl(var(--accent))] border border-[hsl(var(--border))]">
          <p className="font-serif text-xl font-medium text-[hsl(var(--foreground))] mb-2 italic">«Обратиться за помощью — это храбро»</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            Каждый человек может оказаться в трудной ситуации. Это не слабость —
            это часть жизни. Специалисты обучены помогать, и они здесь именно для этого.
          </p>
        </div>
      </div>
    </div>
  );
}
