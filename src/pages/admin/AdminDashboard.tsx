import Icon from "@/components/ui/icon";
import { type DbOrganization } from "@/api/organizations";

export const verColors: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  outdated: "bg-red-50 text-red-700",
};
export const verLabels: Record<string, string> = {
  verified: "Проверено",
  pending: "На проверке",
  outdated: "Устарело",
};

interface Stats {
  total: number;
  verified: number;
  pending: number;
  outdated: number;
}

interface Props {
  orgs: DbOrganization[];
  stats: Stats;
  loading: boolean;
  onAddOrg: () => void;
  onGoModeration: () => void;
  onGoOutdated: () => void;
  onGoList: () => void;
}

export default function AdminDashboard({ orgs, stats, loading, onAddOrg, onGoModeration, onGoOutdated, onGoList }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Всего", value: stats.total, color: "text-[hsl(var(--foreground))]", bg: "bg-white" },
          { label: "Проверено", value: stats.verified, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "На проверке", value: stats.pending, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Устарело", value: stats.outdated, color: "text-red-700", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-[hsl(var(--border))] p-4`}>
            <div className={`font-bold text-2xl ${s.color}`}>{loading ? "—" : s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
        <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddOrg}
            className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[hsl(var(--terra))/40] text-[hsl(var(--terra))] text-sm font-medium hover:bg-[hsl(var(--terra-light))] transition-colors"
          >
            <Icon name="Plus" size={15} />
            Добавить организацию
          </button>
          <button
            onClick={onGoModeration}
            className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <Icon name="CheckSquare" size={15} />
            Проверить {stats.pending} записей
          </button>
          <button
            onClick={onGoOutdated}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Icon name="AlertTriangle" size={15} />
            Устаревших: {stats.outdated}
          </button>
          <button
            onClick={onGoList}
            className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] text-sm font-medium hover:bg-[hsl(var(--border))] transition-colors"
          >
            <Icon name="List" size={15} />
            Все организации
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
        <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-3">Последние добавленные</h3>
        <div className="space-y-2">
          {[...orgs].slice(-5).reverse().map((org) => (
            <div key={org.id} className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
                {org.number ?? "—"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{org.name}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{org.city}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${verColors[org.verification_status] ?? ""}`}>
                {verLabels[org.verification_status] ?? org.verification_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
