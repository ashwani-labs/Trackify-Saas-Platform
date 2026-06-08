package com.trackify.project.config;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Applies idempotent tenant schema upgrades for databases provisioned before newer tables/columns
 * were added to the tenant template (e.g. sprints/backlog).
 */
@Component
public class TenantSchemaUpgrader {

  private static final Logger log = LoggerFactory.getLogger(TenantSchemaUpgrader.class);

  private final Map<Long, Object> tenantLocks = new ConcurrentHashMap<>();
  private final Set<Long> verifiedTenants = ConcurrentHashMap.newKeySet();

  public void upgradeIfNeeded(Long tenantId, DataSource tenantDataSource) {
    if (verifiedTenants.contains(tenantId)) {
      return;
    }
    Object lock = tenantLocks.computeIfAbsent(tenantId, id -> new Object());
    synchronized (lock) {
      JdbcTemplate jdbc = new JdbcTemplate(tenantDataSource);
      if (tableExists(jdbc, "sprints") && columnExists(jdbc, "issues", "sprint_id")) {
        verifiedTenants.add(tenantId);
        return;
      }

      log.info("Applying tenant schema upgrades for tenant_id={}", tenantId);
      createSprintsTable(jdbc);
      addIssueSprintColumn(jdbc);
      verifiedTenants.add(tenantId);
    }
  }

  private void createSprintsTable(JdbcTemplate jdbc) {
    if (tableExists(jdbc, "sprints")) {
      return;
    }

    jdbc.execute(
        """
        CREATE TABLE sprints (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          goal TEXT,
          start_date DATE,
          end_date DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
          project_id BIGINT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id)
        )
        """);
    log.info("Created missing sprints table");
  }

  private void addIssueSprintColumn(JdbcTemplate jdbc) {
    if (columnExists(jdbc, "issues", "sprint_id")) {
      return;
    }

    jdbc.execute("ALTER TABLE issues ADD COLUMN sprint_id BIGINT NULL");

    try {
      jdbc.execute(
          "ALTER TABLE issues ADD CONSTRAINT fk_issues_sprint "
              + "FOREIGN KEY (sprint_id) REFERENCES sprints(id)");
    } catch (DataAccessException ex) {
      log.debug("Could not add fk_issues_sprint (may already exist): {}", ex.getMessage());
    }

    log.info("Added issues.sprint_id column");
  }

  private boolean tableExists(JdbcTemplate jdbc, String tableName) {
    Integer count =
        jdbc.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = ?
            """,
            Integer.class,
            tableName);
    return count != null && count > 0;
  }

  private boolean columnExists(JdbcTemplate jdbc, String tableName, String columnName) {
    Integer count =
        jdbc.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = ?
              AND column_name = ?
            """,
            Integer.class,
            tableName,
            columnName);
    return count != null && count > 0;
  }
}
