-- Legacy upgrade only: issue/project keys are in V1__tenant_schema.sql for new tenants.
-- Run manually against tenant DBs provisioned before V1 included these columns.
ALTER TABLE {{DB_NAME}}.projects ADD COLUMN project_key VARCHAR(10);
ALTER TABLE {{DB_NAME}}.projects ADD COLUMN issue_counter BIGINT NOT NULL DEFAULT 0;
ALTER TABLE {{DB_NAME}}.issues ADD COLUMN issue_key VARCHAR(20);
