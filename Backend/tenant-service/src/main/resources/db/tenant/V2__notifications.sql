CREATE TABLE IF NOT EXISTS {{DB_NAME}}.notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  reference_type VARCHAR(50),
  reference_id BIGINT,
  project_id BIGINT,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
