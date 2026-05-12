import Icon from "@/components/ui/icon";

const savedContacts = [
  {
    id: 1,
    name: "Мария Соколова",
    role: "Психолог · КПТ",
    phone: "+7 (999) 111-22-33",
    city: "Москва",
    online: true,
    emoji: "👤",
  },
  {
    id: 2,
    name: "Телефон доверия",
    role: "Горячая линия · 24/7",
    phone: "8-800-775-17-17",
    city: "Вся Россия",
    online: false,
    emoji: "📞",
  },
];

const savedArticles = [
  {
    id: 1,
    title: "Техники дыхания для быстрого успокоения",
    category: "Практики",
    readTime: "5 мин",
    emoji: "🌬",
  },
  {
    id: 2,
    title: "Как говорить о своих чувствах: руководство",
    category: "Коммуникация",
    readTime: "8 мин",
    emoji: "💬",
  },
];

export default function SavedPage() {
  if (savedContacts.length === 0 && savedArticles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="text-5xl mb-4">💛</div>
        <h2 className="font-serif text-2xl font-medium text-[hsl(var(--foreground))] mb-2">Пока здесь пусто</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs leading-relaxed">
          Сохраняйте понравившихся специалистов и материалы — они будут доступны здесь в любой момент
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className="bg-gradient-to-b from-[hsl(var(--warm-2))] to-[hsl(var(--background))] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl font-medium text-[hsl(var(--foreground))] mb-1">Сохранённое</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Ваши избранные контакты и материалы</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Контакты */}
        {savedContacts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Users" size={15} className="text-[hsl(var(--terra))]" />
              <h2 className="font-semibold text-sm text-[hsl(var(--foreground))]">Специалисты и линии помощи</h2>
              <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{savedContacts.length}</span>
            </div>

            <div className="space-y-2">
              {savedContacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 flex items-center gap-3 card-hover animate-slide-up"
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center text-lg flex-shrink-0">
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))]">{c.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.role}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-0.5">
                        <Icon name="MapPin" size={10} />
                        {c.city}
                      </span>
                      {c.online && (
                        <span className="text-xs text-[hsl(var(--sage))] flex items-center gap-0.5">
                          <Icon name="Video" size={10} />
                          Онлайн
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[\s\-()]/g, "")}`}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-[hsl(var(--terra))] text-white flex items-center justify-center hover:bg-[hsl(16,55%,42%)] transition-colors"
                  >
                    <Icon name="Phone" size={15} />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Материалы */}
        {savedArticles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="BookOpen" size={15} className="text-[hsl(var(--sage))]" />
              <h2 className="font-semibold text-sm text-[hsl(var(--foreground))]">Сохранённые материалы</h2>
              <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{savedArticles.length}</span>
            </div>

            <div className="space-y-2">
              {savedArticles.map((a, i) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4 flex items-center gap-3 card-hover animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--sage-light))] flex items-center justify-center text-lg flex-shrink-0">
                    {a.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[hsl(var(--foreground))] leading-snug">{a.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[hsl(var(--sage))] font-medium">{a.category}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-0.5">
                        <Icon name="Clock" size={10} />
                        {a.readTime}
                      </span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 text-[hsl(var(--terra))] hover:text-[hsl(var(--terra))/70] transition-colors">
                    <Icon name="Bookmark" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Баннер */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[hsl(var(--terra-light))] to-[hsl(var(--warm-2))] border border-[hsl(var(--terra))/20]">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💛</div>
            <div>
              <p className="font-semibold text-sm text-[hsl(var(--foreground))] mb-0.5">Забота о себе начинается здесь</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                Добавляйте специалистов и статьи, чтобы всегда иметь поддержку под рукой
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
