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
    """CRUD для материалов: медитации, ресурсы, вопрос-ответ."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        return get_materials(params)
    elif method == "POST":
        body = json.loads(event.get("body") or "{}")
        return create_material(body)
    elif method == "PUT":
        body = json.loads(event.get("body") or "{}")
        mat_id = params.get("id")
        return update_material(mat_id, body)
    elif method == "DELETE":
        mat_id = params.get("id")
        return delete_material(mat_id)

    return {"statusCode": 405, "headers": cors_headers(), "body": json.dumps({"error": "Method not allowed"})}


def get_materials(params: dict) -> dict:
    mat_type = params.get("type")
    published_only = params.get("published", "true") == "true"

    conn = get_conn()
    cur = conn.cursor()

    where = []
    if mat_type:
        where.append(f"type = '{mat_type}'")
    if published_only:
        where.append("is_published = true")

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    cur.execute(f"SELECT id, type, title, content, description, url, duration_min, sort_order, is_published, created_at, updated_at FROM {SCHEMA}.materials {where_sql} ORDER BY sort_order ASC, created_at DESC")

    rows = cur.fetchall()
    cols = ["id", "type", "title", "content", "description", "url", "duration_min", "sort_order", "is_published", "created_at", "updated_at"]
    result = []
    for row in rows:
        item = dict(zip(cols, row))
        item["created_at"] = str(item["created_at"])
        item["updated_at"] = str(item["updated_at"])
        result.append(item)

    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps(result, ensure_ascii=False)}


def create_material(data: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()

    title = data.get("title", "").replace("'", "''")
    mat_type = data.get("type", "resource")
    content = (data.get("content") or "").replace("'", "''")
    description = (data.get("description") or "").replace("'", "''")
    url = (data.get("url") or "").replace("'", "''")
    duration_min = data.get("duration_min") or "NULL"
    sort_order = data.get("sort_order", 0)
    is_published = "true" if data.get("is_published", True) else "false"

    cur.execute(f"""
        INSERT INTO {SCHEMA}.materials (type, title, content, description, url, duration_min, sort_order, is_published)
        VALUES ('{mat_type}', '{title}', '{content}', '{description}', '{url}', {duration_min}, {sort_order}, {is_published})
        RETURNING id
    """)
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 201, "headers": cors_headers(), "body": json.dumps({"id": new_id})}


def update_material(mat_id: str, data: dict) -> dict:
    if not mat_id:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "id required"})}

    conn = get_conn()
    cur = conn.cursor()

    sets = []
    if "title" in data:
        sets.append(f"title = '{data['title'].replace(chr(39), chr(39)*2)}'")
    if "type" in data:
        sets.append(f"type = '{data['type']}'")
    if "content" in data:
        sets.append(f"content = '{(data['content'] or '').replace(chr(39), chr(39)*2)}'")
    if "description" in data:
        sets.append(f"description = '{(data['description'] or '').replace(chr(39), chr(39)*2)}'")
    if "url" in data:
        sets.append(f"url = '{(data['url'] or '').replace(chr(39), chr(39)*2)}'")
    if "duration_min" in data:
        val = data["duration_min"]
        sets.append(f"duration_min = {val if val is not None else 'NULL'}")
    if "sort_order" in data:
        sets.append(f"sort_order = {data['sort_order']}")
    if "is_published" in data:
        sets.append(f"is_published = {'true' if data['is_published'] else 'false'}")
    sets.append("updated_at = NOW()")

    cur.execute(f"UPDATE {SCHEMA}.materials SET {', '.join(sets)} WHERE id = {mat_id}")
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True})}


def delete_material(mat_id: str) -> dict:
    if not mat_id:
        return {"statusCode": 400, "headers": cors_headers(), "body": json.dumps({"error": "id required"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.materials WHERE id = {mat_id}")
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps({"ok": True})}
