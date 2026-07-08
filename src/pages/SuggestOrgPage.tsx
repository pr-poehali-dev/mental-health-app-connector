import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CATEGORY_META, type OrgCategory } from "@/data/types";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onBack: () => void;
}

const SUGGEST_URL = "https://functions.poehali.dev/c187a9cd-96b8-41f4-b33e-48f3abc0c17e";

const categories = Object.entries(CATEGORY_META) as [OrgCategory, typeof CATEGORY_META[OrgCategory]][];

export default function SuggestOrgPage({ onBack }: Props) {
  const [orgName, setOrgName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = orgName.trim() && contactName.trim() && (phone.trim() || email.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    await fetch(SUGGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org_name: orgName,
        category: category ? CATEGORY_META[category as OrgCategory].label : "",
        city,
        contact_name: contactName,
        phone,
        email,
        website,
        description,
      }),
    });
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen animate-fade-in flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">🙏</div>
          <h1 className="font-semibold text-lg text-[hsl(var(--foreground))] mb-1">Заявка отправлена</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Спасибо! Мы рассмотрим заявку и свяжемся с вами для проверки данных перед размещением в каталоге.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in px-4 py-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] mb-4"
        >
          <Icon name="ArrowLeft" size={14} /> Назад
        </button>

        <h1 className="font-serif text-2xl font-medium text-[hsl(var(--foreground))] mb-2">
          Предложить организацию
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
          Если вы представитель организации, которая оказывает помощь людям с психическими особенностями —
          расскажите о ней, и мы добавим её в каталог после проверки.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">
              Название организации *
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="ООО «Ромашка» / Фонд помощи..."
              className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Категория</label>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key === category ? "" : key)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-colors ${
                    category === key
                      ? "border-[hsl(var(--terra))] bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] font-medium"
                      : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--terra))]"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Город</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="г. Москва"
              className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">
                Контактное лицо *
              </label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Имя Фамилия"
                className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Телефон</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 000-00-00"
                className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.ru"
              className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">Сайт / соцсети</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="vk.com/... или сайт"
              className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--foreground))] mb-1.5 block">
              Кратко о деятельности
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Чем занимается организация, кому помогает..."
              rows={4}
              className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || sending}
            className="w-full py-3 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {sending ? "Отправка..." : "Отправить заявку"}
          </button>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-center">
            * обязательные поля. Мы свяжемся с вами для подтверждения перед публикацией.
          </p>
        </div>
      </div>
    </div>
  );
}
