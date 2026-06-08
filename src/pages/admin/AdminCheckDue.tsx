import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchDueForCheck, updateOrganization, type DueOrganization } from "@/api/organizations";

interface Props {
  onVerified: () => void;
}

export default function AdminCheckDue({ onVerified }: Props) {
  const [orgs, setOrgs] = useState<DueOrganization[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetchDueForCheck().then((data) => {
      setOrgs(data.organizations ?? []);
      setTotal(data.total ?? 0);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: number) => {
    setSaving(id);
    await updateOrganization(id, {
      verification_status: "verified",
      verified_at: new Date().toISOString(),
    });
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    setTotal((t) => t - 1);
    setSaving(null);
    onVerified();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };

  const isOverdue = (next: string | null) => {
    if (!next) return true;
    return new Date(next) <= new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--terra))] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[hsl(var(--foreground))]">Требует проверки</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Организации, у которых прошло 5 месяцев с последней проверки — {total} шт.
          </p>
        </div>
        <button onClick={load} className="text-xs text-[hsl(var(--terra))] hover:underline flex items-center gap-1">
          <Icon name="RefreshCw" size={12} /> Обновить
        </button>
      </div>

      {orgs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-10 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Все организации проверены</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Следующая проверка через 5 месяцев</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 flex items-start gap-3"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isOverdue(org.next_check_at) ? "bg-red-500" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-[hsl(var(--foreground))] leading-snug">{org.name}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {org.city && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                      <Icon name="MapPin" size={10} /> {org.city}
                    </span>
                  )}
                  {org.phones && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                      <Icon name="Phone" size={10} /> {org.phones.split(";")[0].trim()}
                    </span>
                  )}
                  {org.email && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                      <Icon name="Mail" size={10} /> {org.email.split(";")[0].trim()}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                  Последняя проверка: {formatDate(org.verified_at)}
                  {org.next_check_at && (
                    <span className={`ml-2 ${isOverdue(org.next_check_at) ? "text-red-500 font-medium" : ""}`}>
                      · Срок: {formatDate(org.next_check_at)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleConfirm(org.id)}
                disabled={saving === org.id}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {saving === org.id ? (
                  <div className="w-3 h-3 rounded-full border border-emerald-700 border-t-transparent animate-spin" />
                ) : (
                  <Icon name="CheckCircle" size={13} />
                )}
                Проверено
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
