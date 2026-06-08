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
    """Принимает сообщение об ошибке в карточке организации и отправляет email через Resend."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    body = json.loads(event.get("body") or "{}")
    org_id = body.get("org_id", "")
    org_name = body.get("org_name", "")
    error_type = body.get("error_type", "")
    comment = body.get("comment", "").strip()

    if not org_name or not error_type:
        return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "org_name и error_type обязательны"})}

    html = f"""
<h2>Сообщение об ошибке в карточке организации</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
  <tr><td style="padding:6px 12px;color:#666">Организация</td><td style="padding:6px 12px;font-weight:bold">{org_name}</td></tr>
  <tr><td style="padding:6px 12px;color:#666">ID</td><td style="padding:6px 12px">#{org_id}</td></tr>
  <tr><td style="padding:6px 12px;color:#666">Тип ошибки</td><td style="padding:6px 12px">{error_type}</td></tr>
  <tr><td style="padding:6px 12px;color:#666">Комментарий</td><td style="padding:6px 12px">{comment or "—"}</td></tr>
</table>
<p style="color:#999;font-size:12px;margin-top:20px">НавигаторПомощи · navigatorpomoshi.ru</p>
"""

    payload = json.dumps({
        "from": f"НавигаторПомощи <{FROM_EMAIL}>",
        "to": [TO_EMAIL],
        "subject": f"Ошибка в карточке: {org_name}",
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
