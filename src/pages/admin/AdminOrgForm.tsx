import Icon from "@/components/ui/icon";
import { type DbOrganization } from "@/api/organizations";

interface Props {
  editOrg: Partial<DbOrganization>;
  saving: boolean;
  onChange: (org: Partial<DbOrganization>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AdminOrgForm({ editOrg, saving, onChange, onSave, onCancel }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <Icon name="ArrowLeft" size={14} />
          Назад
        </button>
        <h2 className="font-semibold text-sm text-[hsl(var(--foreground))]">
          {editOrg.id ? "Редактировать организацию" : "Добавить организацию"}
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 space-y-4">
        {[
          { field: "name", label: "Название *", placeholder: "Полное официальное название" },
          { field: "category", label: "Категория", placeholder: "Медицинская организация / НКО / Соцзащита..." },
          { field: "org_type", label: "Тип организации", placeholder: "Психиатрическая больница / Диспансер..." },
          { field: "target_group", label: "Для кого", placeholder: "Дети, взрослые, пожилые..." },
          { field: "city", label: "Населённый пункт", placeholder: "Барнаул" },
          { field: "address", label: "Адрес", placeholder: "ул. Суворова, 13" },
          { field: "phones", label: "Телефоны", placeholder: "(3852) 31-32-21; (3852) 66-86-88" },
          { field: "email", label: "Email", placeholder: "info@example.ru" },
          { field: "website_social", label: "Сайт / соцсети", placeholder: "https://example.ru; VK; Telegram" },
          { field: "director", label: "Руководитель", placeholder: "Иванов Иван Иванович" },
          { field: "coordinates", label: "Координаты", placeholder: "53.341, 83.775" },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">{label}</label>
            <input
              type="text"
              value={(editOrg as Record<string, string>)[field] ?? ""}
              onChange={(e) => onChange({ ...editOrg, [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
            />
          </div>
        ))}

        {[
          { field: "short_description", label: "Краткое описание", placeholder: "Чем занимается организация..." },
          { field: "help_types", label: "Виды помощи", placeholder: "психиатрическая помощь; психологическая помощь..." },
          { field: "help_format", label: "Формат помощи", placeholder: "амбулаторно; дневной стационар; онлайн..." },
          { field: "conditions", label: "Условия получения", placeholder: "по ОМС; по направлению врача..." },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">{label}</label>
            <textarea
              value={(editOrg as Record<string, string>)[field] ?? ""}
              onChange={(e) => onChange({ ...editOrg, [field]: e.target.value })}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition resize-none"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Статус проверки</label>
          <select
            value={editOrg.verification_status ?? "pending"}
            onChange={(e) => onChange({ ...editOrg, verification_status: e.target.value as DbOrganization["verification_status"] })}
            className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm bg-white focus:outline-none"
          >
            <option value="verified">✅ Проверено</option>
            <option value="pending">🕐 На проверке</option>
            <option value="outdated">⚠️ Устарело</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSave}
            disabled={saving || !editOrg.name?.trim()}
            className="flex-1 py-3 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] disabled:opacity-50 transition-colors"
          >
            {saving ? "Сохранение..." : editOrg.id ? "Сохранить изменения" : "Добавить организацию"}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
