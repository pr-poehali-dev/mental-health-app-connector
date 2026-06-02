const BASE_URL = "https://functions.poehali.dev/8a26581a-dc6d-406a-8cf7-d6e410763d12";

export type MaterialType = "meditation" | "resource" | "faq";

export interface Material {
  id: number;
  type: MaterialType;
  title: string;
  content: string | null;
  description: string | null;
  url: string | null;
  duration_min: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchMaterials(type?: MaterialType): Promise<Material[]> {
  const qs = new URLSearchParams();
  if (type) qs.set("type", type);
  const url = qs.toString() ? `${BASE_URL}?${qs}` : BASE_URL;
  const res = await fetch(url);
  return res.json();
}

export async function fetchAllMaterials(): Promise<Material[]> {
  const res = await fetch(`${BASE_URL}?published=false`);
  return res.json();
}

export async function createMaterial(data: Partial<Material>): Promise<number> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.id;
}

export async function updateMaterial(id: number, data: Partial<Material>): Promise<void> {
  await fetch(`${BASE_URL}?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteMaterial(id: number): Promise<void> {
  await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
}
