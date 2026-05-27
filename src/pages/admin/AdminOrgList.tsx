import Icon from "@/components/ui/icon";
import { type DbOrganization } from "@/api/organizations";
import { verColors, verLabels } from "./AdminDashboard";

interface Props {
  orgs: DbOrganization[];
  loading: boolean;
  searchQ: string;
  filterStatus: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: string) => void;
  onAdd: () => void;
  onEdit: (org: DbOrganization) => void;
  onVerify: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export default function AdminOrgList({
  orgs,
  loading,
  searchQ,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onAdd,
  onEdit,
  onVerify,
  onDelete,
}: Props) {
  const filtered = orgs.filter((o) => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || o.name.toLowerCase().includes(q) || (o.city ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.verification_status === filterStatus;
    return matchQ && matchStatus;
  });

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="search"
            placeholder="Поиск по названию или городу..."
            value={searchQ}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-sm focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-xs text-[hsl(var(--foreground))] focus:outline-none"
        >
          <option value="all">Все статусы</option>
          <option value="verified">Проверено</option>
          <option value="pending">На проверке</option>
          <option value="outdated">Устарело</option>
        </select>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--terra))] text-white text-xs font-medium"
        >
          <Icon name="Plus" size={13} />
          Добавить
        </button>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        {loading ? "Загрузка..." : `Показано: ${filtered.length} из ${orgs.length}`}
      </p>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[hsl(var(--muted))] text-xs font-bold text-[hsl(var(--muted-foreground))] flex-shrink-0">
                  {org.number ?? "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] leading-snug">{org.name}</div>
                    <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${verColors[org.verification_status] ?? ""}`}>
                      {verLabels[org.verification_status] ?? org.verification_status}
                    </span>
                  </div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">
                    {org.city} · {org.category}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onEdit(org)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[10px] font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors"
                    >
                      <Icon name="Pencil" size={10} /> Редактировать
                    </button>
                    <button
                      onClick={() => onVerify(org.id, "verified")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Icon name="Check" size={10} /> Проверено
                    </button>
                    <button
                      onClick={() => onVerify(org.id, "outdated")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-[10px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Icon name="Clock" size={10} /> Устарело
                    </button>
                    <button
                      onClick={() => onDelete(org.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-[10px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Icon name="Trash2" size={10} /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
