import Icon from "@/components/ui/icon";
import { organizations } from "@/data/organizations";
import {
  CATEGORY_META,
  AGE_META,
  NEED_META,
  SERVICE_META,
  PAYMENT_META,
} from "@/data/types";

interface Props {
  orgId: string;
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function OrgPage({ orgId, onBack }: Props) {
  const org = organizations.find((o) => o.id === orgId);
  if (!org) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-4xl mb-3">🤔</div>
      <p className="font-semibold">Организация не найдена</p>
      <button onClick={onBack} className="mt-4 text-sm text-[hsl(var(--terra))] hover:underline">← Назад</button>
    </div>
  );

  const cat = CATEGORY_META[org.category];
  const verBadge = {
    verified: { label: "Информация проверена", color: "text-emerald-700 bg-emerald-50", icon: "BadgeCheck" },
    pending: { label: "На проверке", color: "text-amber-700 bg-amber-50", icon: "Clock" },
    outdated: { label: "Данные могут быть устаревшими", color: "text-red-700 bg-red-50", icon: "AlertTriangle" },
  }[org.verificationStatus];

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className={`px-4 pt-6 pb-6 ${cat.bg} border-b border-[hsl(var(--border))]`}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] mb-5 hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            Назад
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-white shadow-sm`}>
              {cat.icon}
            </div>
            <div>
              <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.bg} ${cat.color} border border-current/20 mb-2`}>
                {cat.label}
              </span>
              <h1 className="font-serif text-xl font-medium text-[hsl(var(--foreground))] leading-snug">{org.name}</h1>
              {org.city !== "Вся Россия" && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Icon name="MapPin" size={11} />
                  {org.city}{org.address && `, ${org.address}`}
                </div>
              )}
            </div>
          </div>

          {/* Статус верификации */}
          <div className={`flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl text-xs font-medium ${verBadge.color}`}>
            <Icon name={verBadge.icon} size={13} />
            {verBadge.label} · Обновлено {new Date(org.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Простое описание */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Простыми словами</h2>
          <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{org.simpleDescription}</p>
        </div>

        {/* Кому помогает и когда */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👥</span>
              <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Кому помогает</h2>
            </div>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{org.whoHelps}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🕐</span>
              <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Когда обращаться</h2>
            </div>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{org.whenToContact}</p>
          </div>
        </div>

        {/* Целевые группы и особенности */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Работают с</h2>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {org.ageGroups.map((a) => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-medium">
                {AGE_META[a].icon} {AGE_META[a].label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {org.specialNeeds.map((n) => (
              <span key={n} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium">
                {NEED_META[n].label}
              </span>
            ))}
          </div>
        </div>

        {/* Формат и оплата */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Формат помощи</h2>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {org.serviceTypes.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] font-medium">
                {SERVICE_META[s].icon} {SERVICE_META[s].label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {org.paymentTypes.map((p) => (
              <span key={p} className={`text-xs px-2.5 py-1 rounded-xl font-medium ${PAYMENT_META[p].color}`}>
                {PAYMENT_META[p].label}
              </span>
            ))}
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Контакты</h2>
          <div className="space-y-2.5">
            {org.workingHours && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="Clock" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Режим работы</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">{org.workingHours}</div>
                </div>
              </div>
            )}
            {org.phone && (
              <a href={`tel:${org.phone.replace(/[\s\-()]/g, "")}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={14} className="text-[hsl(var(--terra))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Телефон</div>
                  <div className="text-sm font-semibold text-[hsl(var(--terra))] group-hover:underline">{org.phone}</div>
                </div>
              </a>
            )}
            {org.phone2 && (
              <a href={`tel:${org.phone2.replace(/[\s\-()]/g, "")}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={14} className="text-[hsl(var(--terra))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Доп. телефон</div>
                  <div className="text-sm font-semibold text-[hsl(var(--terra))] group-hover:underline">{org.phone2}</div>
                </div>
              </a>
            )}
            {org.email && (
              <a href={`mailto:${org.email}`} className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="Mail" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Email</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))] group-hover:underline">{org.email}</div>
                </div>
              </a>
            )}
            {org.address && org.city !== "Вся Россия" && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Адрес</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">{org.city}, {org.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Соцсети и сайт */}
        {(org.website || org.vk || org.telegram) && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Онлайн</h2>
            <div className="flex flex-wrap gap-2">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors">
                  <Icon name="Globe" size={13} /> Сайт
                </a>
              )}
              {org.vk && (
                <a href={org.vk} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                  <Icon name="Users" size={13} /> ВКонтакте
                </a>
              )}
              {org.telegram && (
                <a href={org.telegram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors">
                  <Icon name="Send" size={13} /> Telegram
                </a>
              )}
            </div>
          </div>
        )}

        {/* Полное описание */}
        <div className="bg-[hsl(var(--muted))] rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Подробно</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{org.description}</p>
        </div>

        {/* Сообщить об ошибке */}
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--terra))] hover:text-[hsl(var(--terra))] transition-colors">
          <Icon name="Flag" size={12} />
          Сообщить об ошибке в данных
        </button>
      </div>
    </div>
  );
}
