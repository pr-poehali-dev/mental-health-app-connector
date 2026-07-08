import json
import os
import urllib.request

TO_EMAIL = "martusova@mental-health-russia.ru"
FROM_EMAIL = "noreply@resend.dev"

def cors():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

def handler(event: dict, context) -> dict:
    """Принимает заявку от представителя организации на размещение в каталоге и отправляет email."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    body = json.loads(event.get("body") or "{}")
    org_name = (body.get("org_name") or "").strip()
    category = (body.get("category") or "").strip()
    city = (body.get("city") or "").strip()
    contact_name = (body.get("contact_name") or "").strip()
    phone = (body.get("phone") or "").strip()
    email = (body.get("email") or "").strip()
    website = (body.get("website") or "").strip()
    description = (body.get("description") or "").strip()

    if not org_name or not contact_name or not (phone or email):
        return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "org_name, contact_name и телефон/email обязательны"})}

    rows = [
        ("Организация", org_name),
        ("Категория", category or "—"),
        ("Город", city or "—"),
        ("Контактное лицо", contact_name),
        ("Телефон", phone or "—"),
        ("Email", email or "—"),
        ("Сайт/соцсети", website or "—"),
        ("Описание", description or "—"),
    ]
    rows_html = "".join(
        f'<tr><td style="padding:6px 12px;color:#666">{k}</td><td style="padding:6px 12px;font-weight:bold">{v}</td></tr>'
        for k, v in rows
    )

    html = f"""
<h2>Заявка на размещение организации в каталоге</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
  {rows_html}
</table>
<p style="color:#999;font-size:12px;margin-top:20px">НавигаторПомощи · navigatorpomoshi.ru</p>
"""

    payload = json.dumps({
        "from": f"НавигаторПомощи <{FROM_EMAIL}>",
        "to": [TO_EMAIL],
        "subject": f"Заявка на размещение: {org_name}",
        "html": html,
    }).encode()

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {os.environ['RESEND_API_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())

    return {
        "statusCode": 200,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "id": result.get("id")}, ensure_ascii=False),
    }
