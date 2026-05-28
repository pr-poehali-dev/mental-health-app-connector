"""Читает Excel-файл из S3, парсит строки и импортирует организации в БД (без дублей)"""
import json
import os
import io
import boto3
import openpyxl
import psycopg2

SCHEMA = "t_p25281756_mental_health_app_co"

def cors():
    return {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors(), "body": ""}

    params = event.get("queryStringParameters") or {}

    # Режим list — показать файлы в S3
    if params.get("mode") == "list":
        s3 = get_s3()
        resp = s3.list_objects_v2(Bucket="files")
        files = [o["Key"] for o in resp.get("Contents", [])]
        return {"statusCode": 200, "headers": cors(), "body": json.dumps({"files": files})}

    # Режим import — читаем конкретный файл
    file_key = params.get("file")
    if not file_key:
        return {"statusCode": 400, "headers": cors(), "body": json.dumps({"error": "Укажи ?file=path/to/file.xlsx"})}

    s3 = get_s3()
    obj = s3.get_object(Bucket="files", Key=file_key)
    data = obj["Body"].read()

    wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
    ws = wb.active

    # Читаем заголовки из первой строки
    headers = []
    for cell in ws[1]:
        val = str(cell.value or "").strip().lower()
        headers.append(val)

    # Маппинг заголовков → поля БД
    FIELD_MAP = {
        "название": "name", "наименование": "name", "name": "name",
        "категория": "category", "category": "category",
        "тип организации": "org_type", "тип": "org_type", "org_type": "org_type",
        "целевая группа": "target_group", "для кого": "target_group",
        "описание": "short_description", "краткое описание": "short_description",
        "виды помощи": "help_types", "помощь": "help_types",
        "формат": "help_format", "формат помощи": "help_format",
        "условия": "conditions",
        "город": "city", "населённый пункт": "city", "нп": "city",
        "адрес": "address",
        "телефон": "phones", "телефоны": "phones", "phones": "phones",
        "email": "email", "эл. почта": "email", "почта": "email",
        "сайт": "website_social", "сайт / соцсети": "website_social",
        "руководитель": "director", "директор": "director",
        "координаты": "coordinates",
        "статус": "verification_status",
        "номер": "number", "№": "number",
    }

    col_map = {}
    for i, h in enumerate(headers):
        for key, field in FIELD_MAP.items():
            if key in h:
                col_map[i] = field
                break

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    # Получаем существующие названия для дедупликации
    cur.execute(f"SELECT LOWER(TRIM(name)) FROM {SCHEMA}.organizations")
    existing_names = set(r[0] for r in cur.fetchall())

    inserted = 0
    skipped = 0
    errors = []
    preview = []

    for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        if not any(row):
            continue

        record = {}
        for col_idx, val in enumerate(row):
            if col_idx in col_map and val is not None:
                record[col_map[col_idx]] = str(val).strip() if val != "" else None

        name = record.get("name", "").strip()
        if not name:
            continue

        # Пропускаем дубли
        if name.lower() in existing_names:
            skipped += 1
            continue

        try:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.organizations
                (number, name, category, org_type, target_group, short_description,
                 help_types, help_format, conditions, city, address, phones,
                 email, website_social, director, coordinates, verification_status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    record.get("number"),
                    name,
                    record.get("category"),
                    record.get("org_type"),
                    record.get("target_group"),
                    record.get("short_description"),
                    record.get("help_types"),
                    record.get("help_format"),
                    record.get("conditions"),
                    record.get("city"),
                    record.get("address"),
                    record.get("phones"),
                    record.get("email"),
                    record.get("website_social"),
                    record.get("director"),
                    record.get("coordinates"),
                    record.get("verification_status", "pending"),
                ),
            )
            existing_names.add(name.lower())
            inserted += 1
            if len(preview) < 5:
                preview.append({"name": name, "city": record.get("city")})
        except Exception as e:
            errors.append({"row": row_idx, "name": name, "error": str(e)})

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**cors(), "Content-Type": "application/json"},
        "body": json.dumps({
            "ok": True,
            "inserted": inserted,
            "skipped_duplicates": skipped,
            "errors": errors,
            "preview": preview,
            "headers_found": list(set(col_map.values())),
        }, ensure_ascii=False),
    }
