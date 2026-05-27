import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  type DbOrganization,
} from "@/api/organizations";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type AdminView = "dashboard" | "list" | "edit" | "moderation";

const ADMIN_PASS = "admin123";

const verColors: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  outdated: "bg-red-50 text-red-700",
};
const verLabels: Record<string, string> = {
  verified: "Проверено",
  pending: "На проверке",
  outdated: "Устарело",
};

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
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
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

  const handleLogin = () => {
    if (pass === ADMIN_PASS) {
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

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

  const filteredOrgs = orgs.filter((o) => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || o.name.toLowerCase().includes(q) || (o.city ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.verification_status === filterStatus;
    return matchQ && matchStatus;
  });

  const stats = {
    total: orgs.length,
    verified: orgs.filter((o) => o.verification_status === "verified").length,
    pending: orgs.filter((o) => o.verification_status === "pending").length,
    outdated: orgs.filter((o) => o.verification_status === "outdated").length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[hsl(var(--muted))]">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-[hsl(var(--border))] p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--terra))] flex items-center justify-center">
              <Icon name="Shield" size={18} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[hsl(var(--foreground))]">Админ-панель</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">НавигаторПомощи</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Пароль</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setPassError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Введите пароль..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition ${passError ? "border-red-400 bg-red-50" : "border-[hsl(var(--border))]"}`}
              />
              {passError && <p className="text-xs text-red-600 mt-1">Неверный пароль</p>}
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] transition-colors"
            >
              Войти
            </button>
          </div>
          <button
            onClick={() => onNavigate("home")}
            className="mt-4 w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] transition-colors"
          >
            ← Вернуться на сайт
          </button>
        </div>
      </div>
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

        {/* ДАШБОРД */}
        {view === "dashboard" && (
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
                  onClick={() => { setEditOrg(emptyOrg()); setView("edit"); }}
                  className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-[hsl(var(--terra))/40] text-[hsl(var(--terra))] text-sm font-medium hover:bg-[hsl(var(--terra-light))] transition-colors"
                >
                  <Icon name="Plus" size={15} />
                  Добавить организацию
                </button>
                <button
                  onClick={() => { setFilterStatus("pending"); setView("moderation"); }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  <Icon name="CheckSquare" size={15} />
                  Проверить {stats.pending} записей
                </button>
                <button
                  onClick={() => { setFilterStatus("outdated"); setView("list"); }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Icon name="AlertTriangle" size={15} />
                  Устаревших: {stats.outdated}
                </button>
                <button
                  onClick={() => { setFilterStatus("all"); setView("list"); }}
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
        )}

        {/* СПИСОК */}
        {view === "list" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="search"
                  placeholder="Поиск по названию или городу..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-sm focus:outline-none"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-xs text-[hsl(var(--foreground))] focus:outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="verified">Проверено</option>
                <option value="pending">На проверке</option>
                <option value="outdated">Устарело</option>
              </select>
              <button
                onClick={() => { setEditOrg(emptyOrg()); setView("edit"); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--terra))] text-white text-xs font-medium"
              >
                <Icon name="Plus" size={13} />
                Добавить
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {loading ? "Загрузка..." : `Показано: ${filteredOrgs.length} из ${orgs.length}`}
            </p>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrgs.map((org) => (
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
                            onClick={() => { setEditOrg({ ...org }); setView("edit"); }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[10px] font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors"
                          >
                            <Icon name="Pencil" size={10} /> Редактировать
                          </button>
                          <button
                            onClick={() => handleVerify(org.id, "verified")}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Icon name="Check" size={10} /> Проверено
                          </button>
                          <button
                            onClick={() => handleVerify(org.id, "outdated")}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-[10px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Icon name="Clock" size={10} /> Устарело
                          </button>
                          <button
                            onClick={() => handleDelete(org.id)}
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
        )}

        {/* НА ПРОВЕРКЕ */}
        {view === "moderation" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Организации, требующие проверки</p>
            {orgs.filter((o) => o.verification_status === "pending").length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Всё проверено!</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Нет организаций, ожидающих проверки</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.filter((o) => o.verification_status === "pending").map((org) => (
                  <div key={org.id} className="bg-white rounded-2xl border border-amber-200 p-4">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">{org.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{org.city} · {org.org_type}</div>
                    {org.phones && <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">📞 {org.phones}</div>}
                    {org.website_social && <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">🌐 {org.website_social}</div>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(org.id, "verified")}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
                      >
                        ✓ Проверено
                      </button>
                      <button
                        onClick={() => handleVerify(org.id, "outdated")}
                        className="flex-1 py-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-medium hover:bg-[hsl(var(--border))] transition-colors"
                      >
                        Устарело
                      </button>
                      <button
                        onClick={() => { setEditOrg({ ...org }); setView("edit"); }}
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
        )}

        {/* ФОРМА РЕДАКТИРОВАНИЯ */}
        {view === "edit" && editOrg !== null && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setView("list"); setEditOrg(null); }}
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
                { field: "name", label: "Название *", placeholder: "Полное официальное название", required: true },
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
                    onChange={(e) => setEditOrg({ ...editOrg, [field]: e.target.value })}
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
                    onChange={(e) => setEditOrg({ ...editOrg, [field]: e.target.value })}
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
                  onChange={(e) => setEditOrg({ ...editOrg, verification_status: e.target.value as DbOrganization["verification_status"] })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm bg-white focus:outline-none"
                >
                  <option value="verified">✅ Проверено</option>
                  <option value="pending">🕐 На проверке</option>
                  <option value="outdated">⚠️ Устарело</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editOrg.name?.trim()}
                  className="flex-1 py-3 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] disabled:opacity-50 transition-colors"
                >
                  {saving ? "Сохранение..." : editOrg.id ? "Сохранить изменения" : "Добавить организацию"}
                </button>
                <button
                  onClick={() => { setView("list"); setEditOrg(null); }}
                  className="px-4 py-3 rounded-xl border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
