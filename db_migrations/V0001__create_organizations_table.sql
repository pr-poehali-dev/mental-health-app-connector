
CREATE TABLE t_p25281756_mental_health_app_co.organizations (
    id                  SERIAL PRIMARY KEY,
    number              INTEGER,
    name                TEXT NOT NULL,
    category            TEXT,
    org_type            TEXT,
    target_group        TEXT,
    short_description   TEXT,
    help_types          TEXT,
    help_format         TEXT,
    conditions          TEXT,
    city                TEXT,
    address             TEXT,
    phones              TEXT,
    email               TEXT,
    website_social      TEXT,
    director            TEXT,
    coordinates         TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    verified_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  t_p25281756_mental_health_app_co.organizations IS 'Справочник организаций помощи';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.number              IS '№ — порядковый номер';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.name                IS 'Организация — название';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.category            IS 'Категория — здравоохранение, НКО, соцзащита и т.д.';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.org_type            IS 'Тип организации';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.target_group        IS 'Для кого — дети, взрослые, пожилые, РАС, ТМНР и т.д.';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.short_description   IS 'Краткое описание';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.help_types          IS 'Виды помощи';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.help_format         IS 'Формат помощи — очно, онлайн, выездной';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.conditions          IS 'Условия получения — бесплатно, по ОМС, платно';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.city                IS 'Населённый пункт';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.address             IS 'Адрес';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.phones              IS 'Телефоны';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.email               IS 'Email';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.website_social      IS 'Сайт / соцсети';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.director            IS 'Руководитель';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.coordinates         IS 'Координаты — широта,долгота';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.verification_status IS 'Статус проверки: pending / verified / outdated';
COMMENT ON COLUMN t_p25281756_mental_health_app_co.organizations.verified_at         IS 'Дата последней проверки';
