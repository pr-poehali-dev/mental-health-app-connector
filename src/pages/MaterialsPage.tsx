import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchMaterials, type Material, type MaterialType } from "@/api/materials";
import { fetchOrganizationById, type DbOrganization } from "@/api/organizations";
import { CATEGORY_META, dbCategoryToKey } from "@/data/types";
import { useSaved } from "@/hooks/useSaved";

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialTab?: string;
}

type Tab = "meditation" | "resource" | "faq" | "saved";

const TABS: { id: Tab; label: string; icon: string; color: string; bg: string }[] = [
  { id: "meditation", label: "Медитации", icon: "Wind", color: "text-violet-600", bg: "bg-violet-50" },
  { id: "resource", label: "Ресурсы", icon: "BookOpen", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "faq", label: "Вопрос–ответ", icon: "MessageCircle", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "saved", label: "Избранное", icon: "Heart", color: "text-rose-600", bg: "bg-rose-50" },
];

const TYPE_LABELS: Record<MaterialType, string> = {
  meditation: "Медитация",
  resource: "Ресурс",
  faq: "FAQ",
};

function MeditationCard({ item, saved, onToggle }: { item: Material; saved: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Icon name="Wind" size={16} className="text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{item.title}</p>
              {item.duration_min && (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{item.duration_min} мин</p>
              )}
            </div>
          </div>
          <button onClick={onToggle} className="flex-shrink-0 p-1.5">
            <Icon name="Heart" size={16} className={saved ? "text-rose-500 fill-rose-500" : "text-[hsl(var(--muted-foreground))]"} />
          </button>
        </div>
        {item.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">{item.description}</p>
        )}
        {item.content && (
          <button
            onClick={() => setOpen(!open)}
            className="text-xs font-medium text-violet-600 hover:underline"
          >
            {open ? "Свернуть" : "Читать практику"}
          </button>
        )}
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="block mt-2 text-xs font-medium text-violet-600 hover:underline"
          >
            Открыть аудио / видео →
          </a>
        )}
      </div>
      {open && item.content && (
        <div className="px-4 pb-4 border-t border-[hsl(var(--border))] pt-3">
          <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-line">{item.content}</p>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ item, saved, onToggle }: { item: Material; saved: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Icon name="BookOpen" size={16} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{item.title}</p>
            {item.description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">{item.description}</p>
            )}
          </div>
        </div>
        <button onClick={onToggle} className="flex-shrink-0 p-1.5">
          <Icon name="Heart" size={16} className={saved ? "text-rose-500 fill-rose-500" : "text-[hsl(var(--muted-foreground))]"} />
        </button>
      </div>
      {item.content && (
        <p className="text-xs text-[hsl(var(--foreground))] mt-3 leading-relaxed">{item.content}</p>
      )}
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 hover:underline"
        >
          Перейти <Icon name="ExternalLink" size={11} />
        </a>
      )}
    </div>
  );
}

function FaqCard({ item, saved, onToggle }: { item: Material; saved: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Icon name="HelpCircle" size={16} className="text-emerald-500" />
          </div>
          <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{item.title}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1">
            <Icon name="Heart" size={14} className={saved ? "text-rose-500 fill-rose-500" : "text-[hsl(var(--muted-foreground))]"} />
          </button>
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-[hsl(var(--muted-foreground))]" />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[hsl(var(--border))] pt-3">
          {item.description && (
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{item.description}</p>
          )}
          {item.content && (
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed mt-2 whitespace-pre-line">{item.content}</p>
          )}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-emerald-600 hover:underline"
            >
              Подробнее <Icon name="ExternalLink" size={11} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage({ onNavigate, initialTab }: Props) {
  const [tab, setTab] = useState<Tab>((initialTab as Tab) ?? "meditation");
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const { saved, toggleMaterial, isSavedMaterial } = useSaved();

  useEffect(() => {
    if (tab === "saved") return;
    setLoading(true);
    fetchMaterials(tab as MaterialType).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [tab]);

  const savedMaterialIds = saved.materials ?? [];
  const savedOrgsIds = saved.orgs ?? [];

  const currentTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Шапка */}
      <div className="sticky top-[53px] z-20 bg-[hsl(var(--background))]/95 backdrop-blur-sm border-b border-[hsl(var(--border))] px-4 pt-3 pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-1 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
            {TABS.map((t) => {
              const isActive = tab === t.id;
              const badge = t.id === "saved" ? savedMaterialIds.length + savedOrgsIds.length : 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
                    isActive
                      ? `${t.bg} ${t.color} border-current shadow-sm`
                      : "bg-white border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <Icon name={t.icon} size={14} />
                  {t.label}
                  {badge > 0 && (
                    <span className="ml-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">

        {/* Медитации */}
        {tab === "meditation" && (
          <>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />)}</div>
            ) : items.length === 0 ? (
              <Empty icon="Wind" text="Медитации пока не добавлены" />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <MeditationCard key={item.id} item={item} saved={isSavedMaterial(item.id)} onToggle={() => toggleMaterial(item.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Ресурсы */}
        {tab === "resource" && (
          <>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />)}</div>
            ) : items.length === 0 ? (
              <Empty icon="BookOpen" text="Ресурсы пока не добавлены" />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <ResourceCard key={item.id} item={item} saved={isSavedMaterial(item.id)} onToggle={() => toggleMaterial(item.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* FAQ */}
        {tab === "faq" && (
          <>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-[hsl(var(--border))] animate-pulse" />)}</div>
            ) : items.length === 0 ? (
              <Empty icon="MessageCircle" text="Вопросы и ответы пока не добавлены" />
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <FaqCard key={item.id} item={item} saved={isSavedMaterial(item.id)} onToggle={() => toggleMaterial(item.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Избранное */}
        {tab === "saved" && (
          <SavedTab savedOrgs={savedOrgsIds} savedMaterials={savedMaterialIds} onNavigate={onNavigate} />
        )}

      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
        <Icon name={icon} size={24} className="text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{text}</p>
    </div>
  );
}

function SavedTab({ savedOrgs, savedMaterials, onNavigate }: { savedOrgs: number[]; savedMaterials: number[]; onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const [matItems, setMatItems] = useState<Material[]>([]);
  const [orgItems, setOrgItems] = useState<Record<number, DbOrganization | null>>({});
  const { toggleMaterial, toggleOrg } = useSaved();

  useEffect(() => {
    if (savedMaterials.length === 0) return;
    fetchMaterials().then((all) => {
      setMatItems(all.filter((m) => savedMaterials.includes(m.id)));
    });
  }, [savedMaterials.join(",")]);

  useEffect(() => {
    savedOrgs.forEach((id) => {
      if (id in orgItems) return;
      fetchOrganizationById(String(id)).then((org) => {
        setOrgItems((prev) => ({ ...prev, [id]: org }));
      });
    });
  }, [savedOrgs.join(",")]);

  if (savedOrgs.length === 0 && savedMaterials.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3">
          <Icon name="Heart" size={24} className="text-rose-300" />
        </div>
        <p className="font-semibold text-[hsl(var(--foreground))] mb-1">Здесь появится избранное</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Нажми ♡ на карточке организации или материала</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedOrgs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Организации</p>
          <div className="space-y-2">
            {savedOrgs.map((id) => {
              const org = orgItems[id];
              const cat = org ? CATEGORY_META[dbCategoryToKey(org.category, org.name)] : null;
              return (
                <div key={id} className="flex items-center gap-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-3.5">
                  <button
                    onClick={() => onNavigate("org", { id: String(id) })}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat?.bg ?? "bg-[hsl(var(--terra-light))]"}`}>
                      {cat ? <span className="text-sm">{cat.icon}</span> : <Icon name="Building2" size={15} className="text-[hsl(var(--terra))]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{org ? org.name : "Загрузка..."}</p>
                      {org?.city && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{org.city}</p>}
                    </div>
                    <Icon name="ChevronRight" size={14} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
                  </button>
                  <button onClick={() => toggleOrg(id)} className="p-1.5 flex-shrink-0">
                    <Icon name="Heart" size={15} className="text-rose-500 fill-rose-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Материалы</p>
          <div className="space-y-2">
            {matItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl border border-[hsl(var(--border))] p-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  item.type === "meditation" ? "bg-violet-50" : item.type === "resource" ? "bg-blue-50" : "bg-emerald-50"
                }`}>
                  <Icon
                    name={item.type === "meditation" ? "Wind" : item.type === "resource" ? "BookOpen" : "HelpCircle"}
                    size={15}
                    className={item.type === "meditation" ? "text-violet-500" : item.type === "resource" ? "text-blue-500" : "text-emerald-500"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{item.title}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.type === "meditation" ? "Медитация" : item.type === "resource" ? "Ресурс" : "FAQ"}</p>
                </div>
                <button onClick={() => toggleMaterial(item.id)} className="p-1.5 flex-shrink-0">
                  <Icon name="Heart" size={15} className="text-rose-500 fill-rose-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}