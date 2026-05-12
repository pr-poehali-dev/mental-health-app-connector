import { useState } from "react";
import Icon from "@/components/ui/icon";
import { organizations as initialOrgs } from "@/data/organizations";
import { CATEGORY_META, type Organization, type VerificationStatus } from "@/data/types";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

type AdminView = "dashboard" | "list" | "edit" | "moderation" | "add";

const ADMIN_PASS = "admin123";

const verColors: Record<VerificationStatus, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  outdated: "bg-red-50 text-red-700",
};

const verLabels: Record<VerificationStatus, string> = {
  verified: "Проверено",
  pending: "На проверке",
  outdated: "Устарело",
};

export default function AdminPage({ onNavigate }: Props) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [view, setView] = useState<AdminView>("dashboard");
  const [orgs, setOrgs] = useState<Organization[]>([...initialOrgs]);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = () => {
    if (pass === ADMIN_PASS) {
      setAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleVerify = (id: string, status: VerificationStatus) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, verificationStatus: status, updatedAt: new Date().toISOString().slice(0, 10) }
          : o
      )
    );
    showToast("Статус обновлён");
  };

  const handleDelete = (id: string) => {
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    showToast("Организация удалена");
  };

  const handleSave = (updated: Organization) => {
    if (orgs.find((o) => o.id === updated.id)) {
      setOrgs((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast("Изменения сохранены");
    } else {
      setOrgs((prev) => [...prev, { ...updated, id: String(Date.now()) }]);
      showToast("Организация добавлена");
    }
    setView("list");
    setEditOrg(null);
  };

  const filteredOrgs = orgs.filter((o) => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.verificationStatus === filterStatus;
    return matchQ && matchStatus;
  });

  const stats = {
    total: orgs.length,
    verified: orgs.filter((o) => o.verificationStatus === "verified").length,
    pending: orgs.filter((o) => o.verificationStatus === "pending").length,
    outdated: orgs.filter((o) => o.verificationStatus === "outdated").length,
  };

  // Авторизация
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition ${
                  passError ? "border-red-400 bg-red-50" : "border-[hsl(var(--border))]"
                }`}
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

          <p className="mt-4 text-[10px] text-center text-[hsl(var(--muted-foreground))]">
            Демо-пароль: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[hsl(var(--foreground))] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      {/* Шапка */}
      <div className="bg-white border-b border-[hsl(var(--border))] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--terra))] flex items-center justify-center">
              <Icon name="Shield" size={15} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-[hsl(var(--foreground))]">Админ-панель</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("home")} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--terra))] transition-colors px-2 py-1">
              ← Сайт
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-red-600 transition-colors px-2 py-1"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Вкладки */}
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
                view === tab.id
                  ? "bg-[hsl(var(--terra))] text-white"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
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
                  <div className={`font-bold text-2xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
              <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-3">Быстрые действия</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setEditOrg({ id: "", name: "", shortName: "", description: "", simpleDescription: "", whoHelps: "", whenToContact: "", category: "nko", ageGroups: [], specialNeeds: [], serviceTypes: [], paymentTypes: [], region: "Москва", city: "Москва", verificationStatus: "pending", updatedAt: new Date().toISOString().slice(0, 10) }); setView("edit"); }}
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

            {/* Последние обновления */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
              <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-3">Недавно обновлённые</h3>
              <div className="space-y-2">
                {[...orgs]
                  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                  .slice(0, 5)
                  .map((org) => (
                    <div key={org.id} className="flex items-center gap-3 py-1">
                      <div className="text-lg">{CATEGORY_META[org.category].icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{org.shortName || org.name}</div>
                        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{new Date(org.updatedAt).toLocaleDateString("ru-RU")}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${verColors[org.verificationStatus]}`}>
                        {verLabels[org.verificationStatus]}
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
                  placeholder="Поиск..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-sm focus:outline-none"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as VerificationStatus | "all")}
                className="px-2.5 py-2 rounded-xl border border-[hsl(var(--border))] bg-white text-xs text-[hsl(var(--foreground))] focus:outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="verified">Проверено</option>
                <option value="pending">На проверке</option>
                <option value="outdated">Устарело</option>
              </select>
              <button
                onClick={() => { setEditOrg({ id: "", name: "", shortName: "", description: "", simpleDescription: "", whoHelps: "", whenToContact: "", category: "nko", ageGroups: [], specialNeeds: [], serviceTypes: [], paymentTypes: [], region: "Москва", city: "Москва", verificationStatus: "pending", updatedAt: new Date().toISOString().slice(0, 10) }); setView("edit"); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--terra))] text-white text-xs font-medium"
              >
                <Icon name="Plus" size={13} />
                Добавить
              </button>
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))]">Показано: {filteredOrgs.length} из {orgs.length}</p>

            <div className="space-y-2">
              {filteredOrgs.map((org) => (
                <div key={org.id} className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${CATEGORY_META[org.category].bg}`}>
                      {CATEGORY_META[org.category].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-sm text-[hsl(var(--foreground))] leading-snug">{org.name}</div>
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${verColors[org.verificationStatus]}`}>
                          {verLabels[org.verificationStatus]}
                        </span>
                      </div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">
                        {org.city} · Обновлено {new Date(org.updatedAt).toLocaleDateString("ru-RU")}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => { setEditOrg(org); setView("edit"); }}
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
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <Icon name="AlertTriangle" size={10} /> Устарело
                        </button>
                        <button
                          onClick={() => { if (confirm("Удалить организацию?")) handleDelete(org.id); }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-[10px] font-medium text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <Icon name="Trash2" size={10} /> Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* МОДЕРАЦИЯ */}
        {view === "moderation" && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="AlertTriangle" size={15} className="text-amber-700" />
                <span className="font-semibold text-sm text-amber-700">Требуют проверки</span>
              </div>
              <p className="text-xs text-amber-600">
                Проверьте актуальность данных каждой организации перед публикацией.
              </p>
            </div>

            {orgs.filter((o) => o.verificationStatus === "pending").length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">✅</div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Всё проверено!</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Нет записей, ожидающих модерации</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orgs.filter((o) => o.verificationStatus === "pending").map((org) => (
                  <div key={org.id} className="bg-white rounded-2xl border border-amber-200 p-4">
                    <div className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">{org.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{org.city} · {org.simpleDescription}</div>
                    {org.phone && (
                      <div className="text-xs text-[hsl(var(--foreground))] mb-3">
                        <span className="text-[hsl(var(--muted-foreground))]">Телефон:</span> {org.phone}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(org.id, "verified")}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        ✓ Подтвердить
                      </button>
                      <button
                        onClick={() => handleVerify(org.id, "outdated")}
                        className="flex-1 py-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs font-medium hover:bg-[hsl(var(--border))] transition-colors"
                      >
                        Отклонить
                      </button>
                      <button
                        onClick={() => { setEditOrg(org); setView("edit"); }}
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

        {/* РЕДАКТОР */}
        {view === "edit" && editOrg && (
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
                {editOrg.id ? "Редактировать" : "Добавить организацию"}
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 space-y-4">
              {[
                { field: "name", label: "Полное название", placeholder: "Официальное название организации" },
                { field: "shortName", label: "Короткое название (необязательно)", placeholder: "Как называть кратко" },
                { field: "city", label: "Город", placeholder: "Москва" },
                { field: "address", label: "Адрес (необязательно)", placeholder: "ул. Примерная, д. 1" },
                { field: "phone", label: "Телефон", placeholder: "+7 (000) 000-00-00" },
                { field: "website", label: "Сайт (необязательно)", placeholder: "https://" },
                { field: "workingHours", label: "Часы работы", placeholder: "Пн–Пт: 9:00–18:00" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(editOrg as Record<string, string>)[field] || ""}
                    onChange={(e) => setEditOrg({ ...editOrg, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition"
                  />
                </div>
              ))}

              {[
                { field: "simpleDescription", label: "Описание простым языком", placeholder: "Чем занимается организация простыми словами..." },
                { field: "whoHelps", label: "Кому помогает", placeholder: "Дети с РАС, взрослые с депрессией..." },
                { field: "whenToContact", label: "Когда обращаться", placeholder: "При каких ситуациях стоит обратиться..." },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">{label}</label>
                  <textarea
                    value={(editOrg as Record<string, string>)[field] || ""}
                    onChange={(e) => setEditOrg({ ...editOrg, [field]: e.target.value })}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition resize-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Категория</label>
                <select
                  value={editOrg.category}
                  onChange={(e) => setEditOrg({ ...editOrg, category: e.target.value as typeof editOrg.category })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm bg-white focus:outline-none"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.icon} {meta.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5">Статус верификации</label>
                <select
                  value={editOrg.verificationStatus}
                  onChange={(e) => setEditOrg({ ...editOrg, verificationStatus: e.target.value as VerificationStatus })}
                  className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm bg-white focus:outline-none"
                >
                  <option value="verified">✅ Проверено</option>
                  <option value="pending">🕐 На проверке</option>
                  <option value="outdated">⚠️ Устарело</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSave(editOrg)}
                  className="flex-1 py-3 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] transition-colors"
                >
                  {editOrg.id ? "Сохранить изменения" : "Добавить организацию"}
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
