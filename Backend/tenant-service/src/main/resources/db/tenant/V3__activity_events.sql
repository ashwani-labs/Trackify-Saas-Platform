-- Legacy upgrade only: activity_events are created in V1__tenant_schema.sql for new tenants.
CREATE TABLE IF NOT EXISTS {{DB_NAME}}.activity_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  issue_id BIGINT,
  actor_user_id BIGINT,
  event_type VARCHAR(50) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
