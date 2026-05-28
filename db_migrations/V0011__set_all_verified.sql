UPDATE t_p25281756_mental_health_app_co.organizations
SET verification_status = 'verified', verified_at = NOW()
WHERE verification_status != 'verified';