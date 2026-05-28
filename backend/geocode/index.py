"""Геокодирование адресов организаций через Nominatim (батчами по offset/limit)"""
import json
import os
import re
import time
import urllib.request
import urllib.parse
import psycopg2


def geocode_address(city: str, address: str):
    clean_city = re.sub(r"^(г\.|с\.|пгт\.)\s*", "", city.strip()).strip()
    clean_addr = address.split(";")[0].strip()
    clean_addr = re.sub(r"^\d{6},?\s*", "", clean_addr)
    clean_addr = re.sub(r"Алтайский край,?\s*", "", clean_addr)
    clean_addr = re.sub(r"[А-Яа-яёЁ]+ (район|край),?\s*", "", clean_addr)
    clean_addr = re.sub(r"^(г\.|с\.|пгт\.)\s*\S+,?\s*", "", clean_addr)
    clean_addr = clean_addr.strip().strip(",").strip()

    query = f"{clean_addr}, {clean_city}, Алтайский край, Россия"
    encoded = urllib.parse.quote(query)
    url = f"https://nominatim.openstreetmap.org/search?q={encoded}&format=json&limit=1&countrycodes=ru"

    req = urllib.request.Request(url, headers={"User-Agent": "mental-health-altai-app/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        data = json.loads(resp.read())

    if data:
        return float(data[0]["lat"]), float(data[0]["lon"])
    return None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    body = json.loads(event.get("body") or "{}")
    offset = int(body.get("offset", 0))
    limit = int(body.get("limit", 5))

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    schema = os.environ.get("MAIN_DB_SCHEMA", "public")

    cur.execute(f"SELECT id, name, city, address FROM {schema}.organizations ORDER BY id LIMIT {limit} OFFSET {offset}")
    rows = cur.fetchall()

    updated = []
    failed = []

    for org_id, name, city, address in rows:
        if not address or not city:
            failed.append({"id": org_id, "name": name, "reason": "no address"})
            continue
        try:
            result = geocode_address(city, address)
            if result:
                lat, lon = result
                coords = f"{lat:.6f},{lon:.6f}"
                cur.execute(f"UPDATE {schema}.organizations SET coordinates = '{coords}' WHERE id = {org_id}")
                updated.append({"id": org_id, "name": name, "coords": coords})
            else:
                failed.append({"id": org_id, "name": name, "reason": "not found"})
            time.sleep(1.1)
        except Exception as e:
            failed.append({"id": org_id, "name": name, "reason": str(e)})

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"updated": len(updated), "failed": len(failed), "details": updated, "errors": failed}, ensure_ascii=False)
    }