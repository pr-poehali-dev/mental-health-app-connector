CREATE TABLE t_p25281756_mental_health_app_co.materials (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('meditation', 'resource', 'faq')),
  title TEXT NOT NULL,
  content TEXT,
  description TEXT,
  url TEXT,
  duration_min INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
