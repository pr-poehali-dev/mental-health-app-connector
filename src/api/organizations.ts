const BASE_URL = "https://functions.poehali.dev/43ba285a-fadf-473f-be49-b661e7131070";

export interface DbOrganization {
  id: number;
  number: number | null;
  name: string;
  category: string | null;
  org_type: string | null;
  target_group: string | null;
  short_description: string | null;
  help_types: string | null;
  help_format: string | null;
  conditions: string | null;
  city: string | null;
  address: string | null;
  phones: string | null;
  email: string | null;
  website_social: string | null;
  director: string | null;
  coordinates: string | null;
  verification_status: "pending" | "verified" | "outdated";
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchOrganizations(params?: {
  search?: string;
  city?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<DbOrganization[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.city) qs.set("city", params.city);
  if (params?.category) qs.set("category", params.category);
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const url = qs.toString() ? `${BASE_URL}?${qs}` : BASE_URL;
  const res = await fetch(url);
  const data = await res.json();
  return (data.organizations ?? data ?? []) as DbOrganization[];
}

export async function fetchAllOrganizations(params?: {
  search?: string;
  city?: string;
  category?: string;
  status?: string;
}): Promise<DbOrganization[]> {
  const PAGE = 200;
  let offset = 0;
  let all: DbOrganization[] = [];
  while (true) {
    const batch = await fetchOrganizations({ ...params, limit: PAGE, offset });
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export async function createOrganization(org: Partial<DbOrganization>): Promise<number> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(org),
  });
  const data = await res.json();
  return data.id;
}

export async function updateOrganization(id: number, org: Partial<DbOrganization>): Promise<void> {
  await fetch(`${BASE_URL}?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(org),
  });
}

export async function deleteOrganization(id: number): Promise<void> {
  await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
}

export async function bulkCreateOrganizations(
  items: Partial<DbOrganization>[]
): Promise<{ created: number; errors: { row: number; error: string }[] }> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return res.json();
}