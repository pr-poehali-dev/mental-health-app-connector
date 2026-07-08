import json
import os


def handler(event: dict, context) -> dict:
    """Отдаёт публичный API-ключ Яндекс.Карт для инициализации карты на фронтенде."""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"apiKey": os.environ.get("YANDEX_MAPS_API_KEY", "")}),
    }
