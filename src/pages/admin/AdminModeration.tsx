import Icon from "@/components/ui/icon";
import { type DbOrganization } from "@/api/organizations";

interface Props {
  orgs: DbOrganization[];
  onVerify: (id: number, status: string) => void;
  onEdit: (org: DbOrganization) => void;
}

export default function AdminModeration({ orgs, onVerify, onEdit }: Props) {
  const pending = orgs.filter((o) => o.verification_status === "pending");

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">Организации, требующие проверки</p>
      {pending.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold text-[hsl(var(--foreground))]">Всё проверено!</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Нет организаций, ожидающих проверки</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl border border-amber-200 p-4">
              <div className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">{org.name}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{org.city} · {org.org_type}</div>
              {org.phones && <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">📞 {org.phones}</div>}
              {org.website_social && <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">🌐 {org.website_social}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => onVerify(org.id, "verified")}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
                >
                  ✓ Проверено
                </button>
                <button
                  onClick={() => onVerify(org.id, "outdated")}
                  className="flex-1 py-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-medium hover:bg-[hsl(var(--border))] transition-colors"
                >
                  Устарело
                </button>
                <button
                  onClick={() => onEdit(org)}
                  className="px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  <Icon name="Pencil" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
