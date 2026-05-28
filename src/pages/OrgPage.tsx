import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchOrganizations, type DbOrganization } from "@/api/organizations";

interface Props {
  orgId: string;
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const verBadge = {
  verified: { label: "Информация проверена", color: "text-emerald-700 bg-emerald-50", icon: "BadgeCheck" },
  pending: { label: "На проверке", color: "text-amber-700 bg-amber-50", icon: "Clock" },
  outdated: { label: "Данные могут быть устаревшими", color: "text-red-700 bg-red-50", icon: "AlertTriangle" },
} as const;

function splitSemicolon(val: string | null | undefined): string[] {
  if (!val) return [];
  return val.split(";").map((s) => s.trim()).filter(Boolean);
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-xl bg-[hsl(var(--terra-light))] flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={14} className="text-[hsl(var(--terra))]" />
      </div>
      <div>
        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</div>
        <div className="text-sm font-semibold text-[hsl(var(--terra))] group-hover:underline">{value}</div>
      </div>
    </div>
  );
  if (href) return <a href={href}>{inner}</a>;
  return inner;
}

export default function OrgPage({ orgId, onBack }: Props) {
  const [org, setOrg] = useState<DbOrganization | null | undefined>(undefined);

  useEffect(() => {
    fetchOrganizations().then((list) => {
      const found = list.find((o) => String(o.id) === String(orgId));
      setOrg(found ?? null);
    });
  }, [orgId]);

  if (org === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--terra))] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (org === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <p className="font-semibold">Организация не найдена</p>
        <button onClick={onBack} className="mt-4 text-sm text-[hsl(var(--terra))] hover:underline">← Назад</button>
      </div>
    );
  }

  const badge = verBadge[org.verification_status] ?? verBadge.pending;
  const phones = splitSemicolon(org.phones);
  const helpTypes = splitSemicolon(org.help_types);
  const helpFormats = splitSemicolon(org.help_format);
  const conditions = splitSemicolon(org.conditions);
  const targetGroups = splitSemicolon(org.target_group);

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className="px-4 pt-6 pb-6 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] mb-5 hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            Назад
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white shadow-sm border border-[hsl(var(--border))]">
              🏥
            </div>
            <div>
              {org.category && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] mb-2">
                  {org.category}
                </span>
              )}
              <h1 className="font-serif text-xl font-medium text-[hsl(var(--foreground))] leading-snug">{org.name}</h1>
              {org.city && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Icon name="MapPin" size={11} />
                  {org.city}{org.address && `, ${org.address}`}
                </div>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-1.5 mt-4 px-3 py-2 rounded-xl text-xs font-medium ${badge.color}`}>
            <Icon name={badge.icon} size={13} />
            {badge.label}
            {org.verified_at && (
              <span className="ml-1 opacity-70">
                · Проверено {new Date(org.verified_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Описание */}
        {org.short_description && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Об организации</h2>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{org.short_description}</p>
          </div>
        )}

        {/* Для кого */}
        {targetGroups.length > 0 && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👥</span>
              <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Кому помогает</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targetGroups.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Виды и формат помощи */}
        {(helpTypes.length > 0 || helpFormats.length > 0) && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Виды и формат помощи</h2>
            {helpTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {helpTypes.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] font-medium">{t}</span>
                ))}
              </div>
            )}
            {helpFormats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {helpFormats.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium">{f}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Условия */}
        {conditions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📋</span>
              <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Условия получения помощи</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Контакты */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Контакты</h2>
          <div className="space-y-2.5">
            {org.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Адрес</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">{org.city && `${org.city}, `}{org.address}</div>
                </div>
              </div>
            )}

            {phones.map((phone, i) => (
              <ContactRow
                key={i}
                icon="Phone"
                label={i === 0 ? "Телефон" : "Доп. телефон"}
                value={phone}
                href={`tel:${phone.replace(/[\s\-()]/g, "")}`}
              />
            ))}

            {org.email && (
              <ContactRow icon="Mail" label="Email" value={org.email} href={`mailto:${org.email}`} />
            )}

            {org.website_social && splitSemicolon(org.website_social).map((link, i) => (
              <ContactRow
                key={i}
                icon={link.startsWith("http") ? "Globe" : "Share2"}
                label={link.startsWith("http") ? "Сайт" : "Соцсети"}
                value={link}
                href={link.startsWith("http") ? link : undefined}
              />
            ))}

            {org.director && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Руководитель</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">{org.director}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Тип организации */}
        {org.org_type && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <Icon name="Info" size={16} className="text-[hsl(var(--muted-foreground))] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              <strong>Тип организации:</strong> {org.org_type}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
