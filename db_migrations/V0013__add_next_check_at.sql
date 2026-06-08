ALTER TABLE t_p25281756_mental_health_app_co.organizations
  ADD COLUMN IF NOT EXISTS next_check_at TIMESTAMP;

-- Для уже проверенных: следующая проверка через 5 месяцев от verified_at (или now())
UPDATE t_p25281756_mental_health_app_co.organizations
SET next_check_at = COALESCE(verified_at::timestamp, NOW()) + INTERVAL '5 months'
WHERE next_check_at IS NULL;