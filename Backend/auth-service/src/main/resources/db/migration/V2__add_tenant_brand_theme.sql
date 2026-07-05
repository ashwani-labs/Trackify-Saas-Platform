ALTER TABLE tenants
  ADD COLUMN brand_theme VARCHAR(50) NOT NULL DEFAULT 'indigo' AFTER primary_color;
