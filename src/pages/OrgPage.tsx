import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchOrganizationById, type DbOrganization } from "@/api/organizations";
import { CATEGORY_META, dbCategoryToKey } from "@/data/types";
import { useSaved } from "@/hooks/useSaved";

const REPORT_URL = "https://functions.poehali.dev/eadd00f4-60fa-4bbc-a178-37e43108399b";

const ERROR_TYPES = [
  "Неверный телефон или email",
  "Неверный адрес",
  "Организация не работает",
  "Устаревшее описание",
  "Другое",
];

function ReportErrorForm({ org, onClose }: { org: DbOrganization; onClose: () => void }) {
  const [errorType, setErrorType] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!errorType) return;
    setSending(true);
    await fetch(REPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id: org.id, org_name: org.name, error_type: errorType, comment }),
    });
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">🙏</div>
        <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Спасибо! Мы проверим данные</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Ваше сообщение передано редактору</p>
        <button onClick={onClose} className="mt-4 text-xs text-[hsl(var(--terra))] hover:underline">Закрыть</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">Что именно неточно?</p>
      <div className="flex flex-col gap-1.5">
        {ERROR_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setErrorType(t)}
            className={`text-left text-sm px-3 py-2 rounded-xl border transition-colors ${
              errorType === t
                ? "border-[hsl(var(--terra))] bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] font-medium"
                : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--terra))]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Уточните подробности (необязательно)..."
        rows={3}
        className="w-full text-sm border border-[hsl(var(--border))] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[hsl(var(--terra))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!errorType || sending}
          className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {sending ? "Отправка..." : "Отправить"}
        </button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          Отмена
        </button>
      </div>
    </div>
  );
}

interface Props {
  orgId: string;
  onBack: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  backLabel?: string;
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

interface ParsedPhone {
  raw: string;
  number: string;
  label: string | null;
  isPriority: boolean;
}

// Разбирает строку телефона вида "горячая линия: +7 ..." / "+7 ... (главный врач)" / "+7 ..., приёмная"
function parsePhoneEntry(raw: string): ParsedPhone {
  let label: string | null = null;
  let number = raw.trim();

  let m = number.match(/^([^\d:]{2,40}):\s*(.+)$/);
  if (m) {
    label = m[1].trim();
    number = m[2].trim();
  } else if ((m = number.match(/^(.+?)\s*\(([^)0-9][^)]{1,40})\)$/))) {
    number = m[1].trim();
    label = m[2].trim();
  } else if ((m = number.match(/^(.+?),\s*([А-Яа-яЁё][^,]{1,40})$/))) {
    number = m[1].trim();
    label = m[2].trim();
  } else if ((m = number.match(/^(.+?)\s*—\s*([А-Яа-яЁё][^—]{1,40})$/))) {
    number = m[1].trim();
    label = m[2].trim();
  }

  const hay = `${label ?? ""} ${raw}`.toLowerCase();
  const isPriority = /довери|горяч.{0,3}лин|экстрен/.test(hay);

  return { raw, number, label, isPriority };
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

export default function OrgPage({ orgId, onBack, backLabel }: Props) {
  const [org, setOrg] = useState<DbOrganization | null | undefined>(undefined);
  const [reportOpen, setReportOpen] = useState(false);
  const [otherPhonesOpen, setOtherPhonesOpen] = useState(false);
  const { toggleOrg, isSaved } = useSaved();

  useEffect(() => {
    fetchOrganizationById(orgId).then((found) => {
      setOrg(found);
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
  const cat = CATEGORY_META[dbCategoryToKey(org.category, org.name)];

  // city может содержать «По направлению», «Уточняется» — тогда реальный город в address
  const FAKE_CITY = ["по направлению", "по иппсу", "по ппсу", "уточняется", "уточнить", "по решению", "экстренно"];
  const isFakeCity = FAKE_CITY.some(m => (org.city ?? "").toLowerCase().includes(m));
  const displayCity = isFakeCity ? null : org.city;
  // Адрес: убираем индекс и "Алтайский край, ..."
  const cleanAddress = (org.address ?? "")
    .replace(/^\d{6},?\s*/, "")
    .replace(/[А-Яа-яёЁ]+ (край|область|обл\.|р-н|район),?\s*/g, "")
    .trim().replace(/^,\s*/, "");

  const parsedPhones = splitSemicolon(org.phones).map(parsePhoneEntry);
  const priorityPhone = parsedPhones.find((p) => p.isPriority) ?? null;
  const otherPhones = parsedPhones.filter((p) => p !== priorityPhone);
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
            {backLabel ? `← ${backLabel}` : "Назад"}
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border ${cat.bg}`}>
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              {org.category && (
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2 ${cat.bg} ${cat.color}`}>
                  {org.category}
                </span>
              )}
              <h1 className="font-serif text-xl font-medium text-[hsl(var(--foreground))] leading-snug">{org.name}</h1>
              {displayCity && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Icon name="MapPin" size={11} />
                  {displayCity}
                </div>
              )}
            </div>
            <button
              onClick={() => toggleOrg(org.id)}
              className="flex-shrink-0 p-2 -mt-1 -mr-1"
              title={isSaved(org.id) ? "Убрать из избранного" : "Добавить в избранное"}
            >
              <Icon name="Heart" size={22} className={isSaved(org.id) ? "text-rose-500 fill-rose-500" : "text-[hsl(var(--muted-foreground))]"} />
            </button>
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

          {/* Главный номер — горячая линия / телефон доверия */}
          {priorityPhone && (
            <a
              href={`tel:${priorityPhone.number.replace(/[\s\-()]/g, "")}`}
              className="mt-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon name="Phone" size={17} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wider opacity-90">
                  {priorityPhone.label ?? "Срочная помощь"}
                </div>
                <div className="text-base font-bold leading-tight">{priorityPhone.number}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/80 flex-shrink-0" />
            </a>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Контакты */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Контакты</h2>
          <div className="space-y-2.5">
            {(cleanAddress || displayCity) && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Адрес</div>
                  <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {displayCity && cleanAddress ? `${displayCity}, ${cleanAddress}` : displayCity || cleanAddress}
                  </div>
                </div>
              </div>
            )}

            {!priorityPhone && otherPhones[0] && (
              <ContactRow
                icon="Phone"
                label={otherPhones[0].label ?? "Телефон"}
                value={otherPhones[0].number}
                href={`tel:${otherPhones[0].number.replace(/[\s\-()]/g, "")}`}
              />
            )}

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

          {/* Другие контакты — свёрнуты по умолчанию */}
          {(priorityPhone ? otherPhones : otherPhones.slice(1)).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setOtherPhonesOpen(!otherPhonesOpen)}
                className="w-full flex items-center justify-between text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Другие контакты ({(priorityPhone ? otherPhones : otherPhones.slice(1)).length})
                <Icon name={otherPhonesOpen ? "ChevronUp" : "ChevronDown"} size={14} />
              </button>
              {otherPhonesOpen && (
                <div className="space-y-2.5 mt-3 animate-slide-up">
                  {(priorityPhone ? otherPhones : otherPhones.slice(1)).map((phone, i) => (
                    <ContactRow
                      key={i}
                      icon="Phone"
                      label={phone.label ?? "Телефон"}
                      value={phone.number}
                      href={`tel:${phone.number.replace(/[\s\-()]/g, "")}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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

        {/* Виды помощи */}
        {helpTypes.length > 0 && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Виды помощи</h2>
            <div className="flex flex-wrap gap-1.5">
              {helpTypes.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--terra-light))] text-[hsl(var(--terra))] font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Формат помощи */}
        {helpFormats.length > 0 && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">Формат помощи</h2>
            <div className="flex flex-wrap gap-1.5">
              {helpFormats.map((f) => (
                <span key={f} className="text-xs px-2.5 py-1 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium">{f}</span>
              ))}
            </div>
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

        {/* Описание */}
        {org.short_description && (
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
            <h2 className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Об организации</h2>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{org.short_description}</p>
          </div>
        )}

        {/* Сообщить об ошибке */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
          {reportOpen ? (
            <ReportErrorForm org={org} onClose={() => setReportOpen(false)} />
          ) : (
            <button
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] transition-colors"
            >
              <Icon name="AlertCircle" size={15} />
              Нашли неточность? Сообщить об ошибке
            </button>
          )}
        </div>

      </div>
    </div>
  );
}