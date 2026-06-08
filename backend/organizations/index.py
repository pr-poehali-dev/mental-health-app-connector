import json
import os
import psycopg2

SCHEMA = "t_p25281756_mental_health_app_co"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

def handler(event: dict, context) -> dict:
    """Управление организациями: получение списка, добавление, редактирование, удаление."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        if params.get("id"):
            return get_organization_by_id(params["id"])
        if params.get("mode") == "stats":
            return get_stats()
        if params.get("mode") == "due":
            return get_due_for_check()
        return get_organizations(params)
    elif method == "POST":
        body = json.loads(event.get("body") or "{}")
        if "items" in body:
            return bulk_create_organizations(body["items"])
        if "delete_from_id" in body:
            return delete_from_id(int(body["delete_from_id"]))
        return create_organization(body)
    elif method == "PUT":
        body = json.loads(event.get("body") or "{}")
        org_id = params.get("id")
        return update_organization(org_id, body)
    elif method == "DELETE":
        org_id = params.get("id")
        return delete_organization(org_id)

    return {"statusCode": 405, "headers": cors_headers(), "body": json.dumps({"error": "Method not allowed"})}


def get_organizations(params: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()

    conditions = []
    values = []

    search = params.get("search", "").strip()
    if search:
        conditions.append("(name ILIKE %s OR city ILIKE %s OR category ILIKE %s OR help_types ILIKE %s)")
        values += [f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"]

    category = params.get("category", "").strip()
    if category:
        conditions.append("category ILIKE %s")
        values.append(f"%{category}%")

    city = params.get("city", "").strip()
    if city:
        conditions.append("city ILIKE %s")
        values.append(f"%{city}%")

    status = params.get("status", "").strip()
    if status:
        conditions.append("verification_status = %s")
        values.append(status)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    limit = int(params.get("limit", 200))
    offset = int(params.get("offset", 0))

    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.organizations {where}",
        values,
    )
    total = cur.fetchone()[0]

    cur.execute(
        f"SELECT id, number, name, category, org_type, target_group, short_description, help_types, help_format, conditions, city, address, phones, email, website_social, director, coordinates, verification_status, verified_at, created_at, updated_at FROM {SCHEMA}.organizations {where} ORDER BY number NULLS LAST, id LIMIT {limit} OFFSET {offset}",
        values,
    )

    cols = [d[0] for d in cur.description]
    rows = []
    for row in cur.fetchall():
        obj = dict(zip(cols, row))
        for k, v in obj.items():
            if hasattr(v, "isoformat"):
                obj[k] = v.isoformat()
        rows.append(obj)

    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"organizations": rows, "total": total, "limit": limit, "offset": offset}, ensure_ascii=False),
    }


def get_stats() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT COUNT(*), COUNT(CASE WHEN verification_status='verified' THEN 1 END), COUNT(DISTINCT category) FROM {SCHEMA}.organizations")
    total, verified, categories = cur.fetchone()
    cur.close()
    conn.close()
    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"total": total, "verified": verified, "categories": categories}, ensure_ascii=False),
    }


def get_due_for_check() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT id, name, category, city, phones, email, verification_status, verified_at, next_check_at
            FROM {SCHEMA}.organizations
            WHERE next_check_at IS NULL OR next_check_at <= NOW()
            ORDER BY next_check_at ASC NULLS FIRST
            LIMIT 500"""
    )
    cols = ["id", "name", "category", "city", "phones", "email", "verification_status", "verified_at", "next_check_at"]
    rows = []
    for row in cur.fetchall():
        obj = dict(zip(cols, row))
        for k, v in obj.items():
            if hasattr(v, "isoformat"):
                obj[k] = v.isoformat()
        rows.append(obj)
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.organizations WHERE next_check_at IS NULL OR next_check_at <= NOW()")
    total = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"organizations": rows, "total": total}, ensure_ascii=False),
    }


def get_organization_by_id(org_id: str) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, number, name, category, org_type, target_group, short_description, help_types, help_format, conditions, city, address, phones, email, website_social, director, coordinates, verification_status, verified_at, created_at, updated_at FROM {SCHEMA}.organizations WHERE id = %s",
        (org_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return {"statusCode": 404, "headers": cors_headers(), "body": json.dumps({"error": "not found"})}
    cols = ["id", "number", "name", "category", "org_type", "target_group", "short_description", "help_types", "help_format", "conditions", "city", "address", "phones", "email", "website_social", "director", "coordinates", "verification_status", "verified_at", "created_at", "updated_at"]
    obj = dict(zip(cols, row))
    for k, v in obj.items():
        if hasattr(v, "isoformat"):
            obj[k] = v.isoformat()
    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"organization": obj}, ensure_ascii=False),
    }


def create_organization(data: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f"""INSERT INTO {SCHEMA}.organizations
        (number, name, category, org_type, target_group, short_description, help_types, help_format, conditions, city, address, phones, email, website_social, director, coordinates, verification_status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id""",
        (
            data.get("number"),
            data.get("name", ""),
            data.get("category"),
            data.get("org_type"),
            data.get("target_group"),
            data.get("short_description"),
            data.get("help_types"),
            data.get("help_format"),
            data.get("conditions"),
            data.get("city"),
            data.get("address"),
            data.get("phones"),
            data.get("email"),
            data.get("website_social"),
            data.get("director"),
            data.get("coordinates"),
            data.get("verification_status", "pending"),
        ),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 201,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"id": new_id, "ok": True}, ensure_ascii=False),
    }


def update_organization(org_id, data: dict) -> dict:
    if not org_id:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "id required"})}

    conn = get_conn()
    cur = conn.cursor()

    fields = ["number", "name", "category", "org_type", "target_group", "short_description",
              "help_types", "help_format", "conditions", "city", "address", "phones",
              "email", "website_social", "director", "coordinates", "verification_status", "verified_at"]

    set_parts = []
    values = []
    for f in fields:
        if f in data:
            set_parts.append(f"{f} = %s")
            values.append(data[f])

    if not set_parts:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "no fields to update"})}

    set_parts.append("updated_at = NOW()")
    # При подтверждении проверки — сдвигаем next_check_at на 5 месяцев
    if data.get("verification_status") == "verified" or data.get("verified_at"):
        set_parts.append("next_check_at = NOW() + INTERVAL '5 months'")
    values.append(org_id)

    cur.execute(
        f"UPDATE {SCHEMA}.organizations SET {', '.join(set_parts)} WHERE id = %s",
        values,
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"ok": True}, ensure_ascii=False),
    }


def bulk_create_organizations(items: list) -> dict:
    if not items:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "items is empty"})}

    conn = get_conn()
    cur = conn.cursor()
    created = 0
    errors = []

    for i, data in enumerate(items):
        if not data.get("name", "").strip():
            errors.append({"row": i + 1, "error": "Пустое название"})
            continue
        cur.execute(
            f"""INSERT INTO {SCHEMA}.organizations
            (number, name, category, org_type, target_group, short_description, help_types, help_format, conditions, city, address, phones, email, website_social, director, coordinates, verification_status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (
                data.get("number"),
                data.get("name", ""),
                data.get("category"),
                data.get("org_type"),
                data.get("target_group"),
                data.get("short_description"),
                data.get("help_types"),
                data.get("help_format"),
                data.get("conditions"),
                data.get("city"),
                data.get("address"),
                data.get("phones"),
                data.get("email"),
                data.get("website_social"),
                data.get("director"),
                data.get("coordinates"),
                data.get("verification_status", "pending"),
            ),
        )
        created += 1

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 201,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"created": created, "errors": errors, "ok": True}, ensure_ascii=False),
    }


def delete_from_id(min_id: int) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.organizations WHERE id >= %s", (min_id,))
    deleted = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": {**cors_headers(), "Content-Type": "application/json"}, "body": json.dumps({"ok": True, "deleted": deleted})}


def delete_organization(org_id) -> dict:
    if not org_id:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "id required"})}

    conn = get_conn()
    cur = conn.cursor()

    # Поддержка массового удаления: id=24+ (все с id больше числа)
    if str(org_id).endswith("+"):
        min_id = int(str(org_id)[:-1])
        cur.execute(f"DELETE FROM {SCHEMA}.organizations WHERE id >= %s", (min_id,))
        deleted = cur.rowcount
    else:
        cur.execute(f"DELETE FROM {SCHEMA}.organizations WHERE id = %s", (org_id,))
        deleted = cur.rowcount

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "deleted": deleted}, ensure_ascii=False),
    }