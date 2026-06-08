-- Legacy upgrade: sprints are included in V1__tenant_schema.sql for newly provisioned tenants.
-- Run against tenant DBs that were provisioned before sprints/backlog support.

CREATE TABLE IF NOT EXISTS {{DB_NAME}}.sprints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
  project_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES {{DB_NAME}}.projects(id)
);

ALTER TABLE {{DB_NAME}}.issues ADD COLUMN sprint_id BIGINT NULL;

ALTER TABLE {{DB_NAME}}.issues
  ADD CONSTRAINT fk_issues_sprint FOREIGN KEY (sprint_id) REFERENCES {{DB_NAME}}.sprints(id);
