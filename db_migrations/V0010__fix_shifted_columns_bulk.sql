-- Для всех организаций где phones содержит адрес (индекс или "обл.", "р-н", "ул.")
-- переставляем поля: phones→address, email→phones, website_social→email, director→website_social
UPDATE t_p25281756_mental_health_app_co.organizations
SET
  address        = phones,
  phones         = email,
  email          = website_social,
  website_social = director,
  director       = NULL,
  city           = CASE
                     WHEN city ILIKE 'по%' OR city ILIKE 'уточн%' THEN address
                     ELSE city
                   END
WHERE (phones ILIKE '%обл%' OR phones ILIKE '%р-н%' OR phones ILIKE '%ул.%' OR phones ILIKE '%д. %')
  AND id != 808;