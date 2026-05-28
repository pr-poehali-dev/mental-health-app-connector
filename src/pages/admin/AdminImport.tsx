import { useState } from "react";
import Icon from "@/components/ui/icon";
import { bulkCreateOrganizations, type DbOrganization } from "@/api/organizations";

interface Props {
  onDone: (count: number) => void;
}

type ParsedRow = Partial<DbOrganization>;

const COLUMN_ALIASES: Record<string, keyof DbOrganization> = {
  "№": "number",
  "номер": "number",
  "number": "number",
  "название": "name",
  "наименование": "name",
  "name": "name",
  "категория": "category",
  "category": "category",
  "тип": "org_type",
  "тип организации": "org_type",
  "org_type": "org_type",
  "целевая группа": "target_group",
  "для кого": "target_group",
  "target_group": "target_group",
  "описание": "short_description",
  "краткое описание": "short_description",
  "short_description": "short_description",
  "виды помощи": "help_types",
  "help_types": "help_types",
  "формат": "help_format",
  "формат помощи": "help_format",
  "help_format": "help_format",
  "условия": "conditions",
  "conditions": "conditions",
  "город": "city",
  "населённый пункт": "city",
  "city": "city",
  "адрес": "address",
  "address": "address",
  "телефон": "phones",
  "телефоны": "phones",
  "phones": "phones",
  "email": "email",
  "почта": "email",
  "сайт": "website_social",
  "сайт / соцсети": "website_social",
  "website_social": "website_social",
  "руководитель": "director",
  "director": "director",
  "координаты": "coordinates",
  "coordinates": "coordinates",
  "статус": "verification_status",
  "verification_status": "verification_status",
};

function parseTsv(text: string): { headers: string[]; rows: ParsedRow[]; unknown: string[] } {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [], unknown: [] };

  const sep = lines[0].includes("\t") ? "\t" : ",";
  const rawHeaders = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  const mappedHeaders: (keyof DbOrganization | null)[] = rawHeaders.map(
    (h) => COLUMN_ALIASES[h] ?? null
  );
  const unknown = rawHeaders.filter((h) => !COLUMN_ALIASES[h]);

  const rows: ParsedRow[] = lines.slice(1).map((line) => {
    const cells = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = {};
    mappedHeaders.forEach((field, i) => {
      if (!field) return;
      const val = cells[i] ?? "";
      if (!val) return;
      if (field === "number") {
        const n = parseInt(val, 10);
        if (!isNaN(n)) (row as Record<string, unknown>)[field] = n;
      } else {
        (row as Record<string, unknown>)[field] = val;
      }
    });
    return row;
  });

  return { headers: rawHeaders, rows, unknown };
}

export default function AdminImport({ onDone }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<{ headers: string[]; rows: ParsedRow[]; unknown: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; error: string }[] } | null>(null);

  const handleParse = () => {
    const p = parseTsv(text);
    setParsed(p);
    setResult(null);
  };

  const handleImport = async () => {
    if (!parsed || parsed.rows.length === 0) return;
    setLoading(true);
    try {
      const res = await bulkCreateOrganizations(parsed.rows.map((r) => ({ ...r, verification_status: "verified" as const })));
      setResult(res);
      if (res.created > 0) {
        onDone(res.created);
        setText("");
        setParsed(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5">
        <h3 className="font-semibold text-sm text-[hsl(var(--foreground))] mb-1">Массовый импорт организаций</h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
          Скопируйте таблицу из Excel или Google Sheets и вставьте сюда. Первая строка — заголовки колонок.
        </p>

        <div className="bg-[hsl(var(--muted))] rounded-xl p-3 mb-4 text-[10px] text-[hsl(var(--muted-foreground))] space-y-1">
          <p className="font-semibold text-xs text-[hsl(var(--foreground))]">Поддерживаемые названия колонок:</p>
          <p>Название / Категория / Тип организации / Для кого / Описание / Виды помощи / Формат помощи / Условия / Город / Адрес / Телефоны / Email / Сайт / Руководитель / Координаты</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); setResult(null); }}
          placeholder={"Вставьте таблицу из Excel / Google Sheets...\n\nНазвание\tКатегория\tГород\t...\nПример организации\tМедицинская\tБарнаул\t..."}
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--terra))/30] transition resize-y"
        />

        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="mt-3 w-full py-2.5 rounded-xl border-2 border-[hsl(var(--terra))] text-[hsl(var(--terra))] text-sm font-semibold hover:bg-[hsl(var(--terra-light))] disabled:opacity-40 transition-colors"
        >
          Проверить данные
        </button>
      </div>

      {parsed && parsed.rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">
              Предпросмотр — {parsed.rows.length} строк
            </h3>
            {parsed.unknown.length > 0 && (
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Не распознаны: {parsed.unknown.join(", ")}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  <th className="text-left px-3 py-2 font-medium">#</th>
                  <th className="text-left px-3 py-2 font-medium">Название</th>
                  <th className="text-left px-3 py-2 font-medium">Категория</th>
                  <th className="text-left px-3 py-2 font-medium">Город</th>
                  <th className="text-left px-3 py-2 font-medium">Телефоны</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-[hsl(var(--border))]">
                    <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">{row.number ?? i + 1}</td>
                    <td className="px-3 py-2 font-medium text-[hsl(var(--foreground))] max-w-[200px] truncate">
                      {row.name || <span className="text-red-500">— пусто —</span>}
                    </td>
                    <td className="px-3 py-2 text-[hsl(var(--muted-foreground))] max-w-[120px] truncate">{row.category ?? "—"}</td>
                    <td className="px-3 py-2 text-[hsl(var(--muted-foreground))]">{row.city ?? "—"}</td>
                    <td className="px-3 py-2 text-[hsl(var(--muted-foreground))] max-w-[120px] truncate">{row.phones ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsed.rows.length > 10 && (
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-center">
              ...и ещё {parsed.rows.length - 10} строк (показаны первые 10)
            </p>
          )}

          {!result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[hsl(var(--terra))] text-white text-sm font-semibold hover:bg-[hsl(16,55%,42%)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Загружаем..." : `Загрузить ${parsed.rows.length} организаций`}
            </button>
          )}
        </div>
      )}

      {parsed && parsed.rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 text-center">
          <Icon name="AlertTriangle" size={20} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">Не удалось распознать данные</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Убедитесь, что первая строка — заголовки, а данные разделены табуляцией или запятой.</p>
        </div>
      )}

      {result && (
        <div className={`bg-white rounded-2xl border p-5 space-y-2 ${result.errors.length > 0 ? "border-amber-200" : "border-emerald-200"}`}>
          <div className="flex items-center gap-2">
            <Icon name={result.errors.length === 0 ? "CheckCircle" : "AlertTriangle"} size={18} className={result.errors.length === 0 ? "text-emerald-500" : "text-amber-500"} />
            <p className="font-semibold text-sm text-[hsl(var(--foreground))]">
              Загружено: {result.created} организаций
            </p>
          </div>
          {result.errors.map((e, i) => (
            <p key={i} className="text-xs text-red-600">Строка {e.row}: {e.error}</p>
          ))}
        </div>
      )}
    </div>
  );
}