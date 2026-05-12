import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Specialist {
  id: number;
  name: string;
  specialty: string;
  type: string;
  city: string;
  online: boolean;
  rating: number;
  reviews: number;
  price: string;
  tags: string[];
  phone: string;
  about: string;
}

const specialists: Specialist[] = [
  {
    id: 1,
    name: "Мария Соколова",
    specialty: "Психолог",
    type: "Индивидуальная терапия",
    city: "Москва",
    online: true,
    rating: 4.9,
    reviews: 87,
    price: "от 3 500 ₽",
    tags: ["Тревога", "Депрессия", "Самооценка"],
    phone: "+7 (999) 111-22-33",
    about: "10 лет опыта. Специализация на тревожных расстройствах и депрессии. Работает по КПТ.",
  },
  {
    id: 2,
    name: "Алексей Петров",
    specialty: "Психотерапевт",
    type: "Семейная терапия",
    city: "Санкт-Петербург",
    online: true,
    rating: 4.8,
    reviews: 64,
    price: "от 4 000 ₽",
    tags: ["Отношения", "Семья", "Кризис"],
    phone: "+7 (999) 222-33-44",
    about: "Работает с парами и семьями. Системный семейный терапевт. Опыт 8 лет.",
  },
  {
    id: 3,
    name: "Елена Новикова",
    specialty: "Психиатр",
    type: "Медикаментозное лечение",
    city: "Москва",
    online: false,
    rating: 4.9,
    reviews: 112,
    price: "от 5 000 ₽",
    tags: ["Биполярное", "ОКР", "Фобии"],
    phone: "+7 (999) 333-44-55",
    about: "Кандидат медицинских наук, психиатр высшей категории. Принимает очно.",
  },
  {
    id: 4,
    name: "Центр «Равновесие»",
    specialty: "Психологический центр",
    type: "Групповая терапия",
    city: "Казань",
    online: true,
    rating: 4.7,
    reviews: 203,
    price: "от 1 500 ₽",
    tags: ["Группы поддержки", "Стресс", "Горе"],
    phone: "+7 (843) 555-66-77",
    about: "Психологический центр с командой из 12 специалистов. Групповые программы.",
  },
  {
    id: 5,
    name: "Дмитрий Захаров",
    specialty: "Психолог",
    type: "Детская психология",
    city: "Новосибирск",
    online: true,
    rating: 4.8,
    reviews: 45,
    price: "от 2 800 ₽",
    tags: ["Дети", "Подростки", "СДВГ"],
    phone: "+7 (999) 444-55-66",
    about: "Специалист по детской и подростковой психологии. Работает с детьми от 4 лет.",
  },
  {
    id: 6,
    name: "Анна Белова",
    specialty: "Психотерапевт",
    type: "Индивидуальная терапия",
    city: "Москва",
    online: true,
    rating: 5.0,
    reviews: 38,
    price: "от 4 500 ₽",
    tags: ["Травма", "ПТСР", "Насилие"],
    phone: "+7 (999) 666-77-88",
    about: "Специалист по работе с психологической травмой. EMDR-терапевт.",
  },
];

const specialties = ["Все", "Психолог", "Психотерапевт", "Психиатр", "Психологический центр"];
const types = ["Все типы", "Индивидуальная терапия", "Семейная терапия", "Детская психология", "Групповая терапия", "Медикаментозное лечение"];
const cities = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Новосибирск"];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("Все");
  const [type, setType] = useState("Все типы");
  const [city, setCity] = useState("Все города");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = specialists.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q));
    const matchSpec = specialty === "Все" || s.specialty === specialty;
    const matchType = type === "Все типы" || s.type === type;
    const matchCity = city === "Все города" || s.city === city;
    const matchOnline = !onlineOnly || s.online;
    return matchSearch && matchSpec && matchType && matchCity && matchOnline;
  });

  const toggleSave = (id: number) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className="bg-gradient-to-b from-[hsl(var(--terra-light))] to-[hsl(var(--background))] px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl font-medium text-[hsl(var(--foreground))] mb-1">Справочник</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">Найдите специалиста, которому доверяете</p>

          {/* Поиск */}
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Поиск по имени или проблеме..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
            />
          </div>

          {/* Фильтры */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  specialty === s
                    ? "bg-[hsl(var(--terra))] text-white"
                    : "bg-white border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Доп. фильтры */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs bg-white text-[hsl(var(--foreground))] focus:outline-none"
          >
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs bg-white text-[hsl(var(--foreground))] focus:outline-none"
          >
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>

          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              onlineOnly
                ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))/40] text-[hsl(var(--sage))]"
                : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
            }`}
          >
            <Icon name="Video" size={12} />
            Только онлайн
          </button>
        </div>

        {/* Счётчик */}
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
          Найдено: <span className="font-medium text-[hsl(var(--foreground))]">{filtered.length}</span> специалистов
        </p>

        {/* Карточки */}
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 card-hover animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center text-lg flex-shrink-0">
                    {s.specialty === "Психологический центр" ? "🏛" : "👤"}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))]">{s.name}</div>
                    <div className="text-xs text-[hsl(var(--terra))]">{s.specialty} · {s.type}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(s.id)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    saved.includes(s.id)
                      ? "bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <Icon name={saved.includes(s.id) ? "Heart" : "Heart"} size={14} />
                </button>
              </div>

              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3 leading-relaxed">{s.about}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-xs text-[hsl(var(--muted-foreground))]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={11} />
                    {s.city}
                  </span>
                  {s.online && (
                    <span className="flex items-center gap-1 text-[hsl(var(--sage))]">
                      <Icon name="Video" size={11} />
                      Онлайн
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon name="Star" size={11} className="text-amber-400" />
                    {s.rating} ({s.reviews})
                  </span>
                </div>
                <div className="text-xs font-semibold text-[hsl(var(--terra))]">{s.price}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex gap-2">
                <a
                  href={`tel:${s.phone}`}
                  className="flex-1 py-2 rounded-lg bg-[hsl(var(--terra))] text-white text-xs font-medium text-center hover:bg-[hsl(16,55%,42%)] transition-colors"
                >
                  Позвонить
                </a>
                <button className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
                  Записаться
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">Ничего не найдено</p>
              <p className="text-xs mt-1">Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
