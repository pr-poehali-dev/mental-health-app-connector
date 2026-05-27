import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  type DbOrganization,
} from "@/api/organizations";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrgList from "./admin/AdminOrgList";
import AdminModeration from "./admin/AdminModeration";
import AdminOrgForm from "./admin/AdminOrgForm";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type AdminView = "dashboard" | "list" | "edit" | "moderation";

const emptyOrg = (): Partial<DbOrganization> => ({
  name: "",
  category: "",
  org_type: "",
  target_group: "",
  short_description: "",
  help_types: "",
  help_format: "",
  conditions: "",
  city: "",
  address: "",
  phones: "",
  email: "",
  website_social: "",
  director: "",
  coordinates: "",
  verification_status: "pending",
});

export default function AdminPage({ onNavigate }: Props) {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<AdminView>("dashboard");
  const [orgs, setOrgs] = useState<DbOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOrg, setEditOrg] = useState<Partial<DbOrganization> | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrgs = () => {
    setLoading(true);
    fetchOrganizations().then((data) => {
      setOrgs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (authed) loadOrgs();
  }, [authed]);

  const handleVerify = async (id: number, status: string) => {
    const verifiedAt = status === "verified" ? new Date().toISOString() : null;
    await updateOrganization(id, { verification_status: status as DbOrganization["verification_status"], verified_at: verifiedAt });
    setOrgs((prev) => prev.map((o) => o.id === id ? { ...o, verification_status: status as DbOrganization["verification_status"], verified_at: verifiedAt } : o));
    showToast("Статус обновлён");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить организацию?")) return;
    await deleteOrganization(id);
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    showToast("Организация удалена");
  };

  const handleSave = async () => {
    if (!editOrg || !editOrg.name?.trim()) return;
    setSaving(true);
    try {
      if (editOrg.id) {
        await updateOrganization(editOrg.id, editOrg);
        setOrgs((prev) => prev.map((o) => o.id === editOrg.id ? { ...o, ...editOrg } as DbOrganization : o));
        showToast("Изменения сохранены");
      } else {
        const newId = await createOrganization(editOrg);
        setOrgs((prev) => [...prev, { ...editOrg, id: newId } as DbOrganization]);
        showToast("Организация добавлена");
      }
      setView("list");
      setEditOrg(null);
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: orgs.length,
    verified: orgs.filter((o) => o.verification_status === "verified").length,
    pending: orgs.filter((o) => o.verification_status === "pending").length,
    outdated: orgs.filter((o) => o.verification_status === "outdated").length,
  };

  if (!authed) {
    return (
      <AdminLogin
        onLogin={() => setAuthed(true)}
        onNavigateHome={() => onNavigate("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[hsl(var(--foreground))] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="bg-white border-b border-[hsl(var(--border))] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--terra))] flex items-center justify-center">
              <Icon name="Shield" size={15} className="text-white" />
            </div>
            <div className="font-semibold text-sm text-[hsl(var(--foreground))]">Админ-панель</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] transition-colors px-2 py-1">
              ← Сайт
            </button>
            <button onClick={() => setAuthed(false)} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-red-600 transition-colors px-2 py-1">
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex gap-1 mb-5 bg-white rounded-xl border border-[hsl(var(--border))] p-1">
          {[
            { id: "dashboard", label: "Обзор", icon: "LayoutDashboard" },
            { id: "list", label: "Организации", icon: "List" },
            { id: "moderation", label: `На проверке (${stats.pending})`, icon: "CheckSquare" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as AdminView)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                view === tab.id ? "bg-[hsl(var(--terra))] text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {view === "dashboard" && (
          <AdminDashboard
            orgs={orgs}
            stats={stats}
            loading={loading}
            onAddOrg={() => { setEditOrg(emptyOrg()); setView("edit"); }}
            onGoModeration={() => { setFilterStatus("pending"); setView("moderation"); }}
            onGoOutdated={() => { setFilterStatus("outdated"); setView("list"); }}
            onGoList={() => { setFilterStatus("all"); setView("list"); }}
          />
        )}

        {view === "list" && (
          <AdminOrgList
            orgs={orgs}
            loading={loading}
            searchQ={searchQ}
            filterStatus={filterStatus}
            onSearchChange={setSearchQ}
            onFilterChange={setFilterStatus}
            onAdd={() => { setEditOrg(emptyOrg()); setView("edit"); }}
            onEdit={(org) => { setEditOrg({ ...org }); setView("edit"); }}
            onVerify={handleVerify}
            onDelete={handleDelete}
          />
        )}

        {view === "moderation" && (
          <AdminModeration
            orgs={orgs}
            onVerify={handleVerify}
            onEdit={(org) => { setEditOrg({ ...org }); setView("edit"); }}
          />
        )}

        {view === "edit" && editOrg !== null && (
          <AdminOrgForm
            editOrg={editOrg}
            saving={saving}
            onChange={setEditOrg}
            onSave={handleSave}
            onCancel={() => { setView("list"); setEditOrg(null); }}
          />
        )}
      </div>
    </div>
  );
}
