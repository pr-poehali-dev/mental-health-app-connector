import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  fetchAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  type Material,
  type MaterialType,
} from "@/api/materials";

const TYPE_OPTIONS: { value: MaterialType; label: string; icon: string }[] = [
  { value: "meditation", label: "Медитация", icon: "Wind" },
  { value: "resource", label: "Ресурс", icon: "BookOpen" },
  { value: "faq", label: "Вопрос–ответ", icon: "HelpCircle" },
];

const emptyMaterial = (): Partial<Material> => ({
  type: "meditation",
  title: "",
  description: "",
  content: "",
  url: "",
  duration_min: undefined,
  sort_order: 0,
  is_published: true,
});

export default function AdminMaterials() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Material> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<MaterialType | "all">("all");

  const load = () => {
    setLoading(true);
    fetchAllMaterials().then((data) => { setItems(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing || !editing.title?.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await updateMaterial(editing.id, editing);
        setItems((prev) => prev.map((m) => m.id === editing.id ? { ...m, ...editing } as Material : m));
      } else {
        const newId = await createMaterial(editing);
        setItems((prev) => [...prev, { ...editing, id: newId } as Material]);
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить материал?")) return;
    await deleteMaterial(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  const filtered = filterType === "all" ? items : items.filter((m) => m.type === filterType);

  if (editing !== null) {
    return (
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm">{editing.id ? "Редактировать" : "Новый материал"}</h3>
          <button onClick={() => setEditing(null)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Тип</label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setEditing((p) => ({ ...p, type: t.value }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    editing.type === t.value
                      ? "bg-[hsl(var(--terra))] text-white border-[hsl(var(--terra))]"
                      : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <Icon name={t.icon} size={12} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Заголовок *</label>
            <input
              value={editing.title || ""}
              onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              placeholder="Название материала"
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Краткое описание</label>
            <input
              value={editing.description || ""}
              onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
              placeholder="Одна строка — будет видна на карточке"
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
              {editing.type === "faq" ? "Ответ" : "Текст / практика"}
            </label>
            <textarea
              value={editing.content || ""}
              onChange={(e) => setEditing((p) => ({ ...p, content: e.target.value }))}
              placeholder="Полный текст..."
              rows={5}
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Ссылка (URL)</label>
            <input
              value={editing.url || ""}
              onChange={(e) => setEditing((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30]"
            />
          </div>

          {editing.type === "meditation" && (
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Длительность (мин)</label>
              <input
                type="number"
                value={editing.duration_min ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, duration_min: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="10"
                className="w-full px-3 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_pub"
              checked={editing.is_published ?? true}
              onChange={(e) => setEditing((p) => ({ ...p, is_published: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="is_pub" className="text-sm text-[hsl(var(--foreground))]">Опубликовано</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !editing.title?.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white rounded-xl border border-[hsl(var(--border))] p-1">
          {([["all", "Все"], ["meditation", "Медитации"], ["resource", "Ресурсы"], ["faq", "FAQ"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterType(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === val ? "bg-[hsl(var(--terra))] text-white" : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing(emptyMaterial())}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[hsl(var(--terra))] text-white text-xs font-medium"
        >
          <Icon name="Plus" size={13} /> Добавить
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-[hsl(var(--muted-foreground))]">Материалов нет — нажмите «Добавить»</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const t = TYPE_OPTIONS.find((x) => x.value === item.type)!;
            return (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-3.5">
                <div className="w-8 h-8 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon name={t.icon} size={14} className="text-[hsl(var(--muted-foreground))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{item.title}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {t.label} · {item.is_published ? "Опубликован" : "Скрыт"}
                    {item.duration_min ? ` · ${item.duration_min} мин` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ ...item })} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-600">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
