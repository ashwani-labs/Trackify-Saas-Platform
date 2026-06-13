package com.trackify.project.config;

import com.trackify.project.util.ProjectKeyUtil;
import java.util.HashSet;
import java.util.List;
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
 * were added to the tenant template (e.g. sprints, issue keys).
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
      if (verifiedTenants.contains(tenantId)) {
        return;
      }

      JdbcTemplate jdbc = new JdbcTemplate(tenantDataSource);
      log.info("Applying tenant schema upgrades for tenant_id={}", tenantId);
      createSprintsTable(jdbc);
      addIssueSprintColumn(jdbc);
      ensureIssueKeyColumns(jdbc);
      backfillProjectAndIssueKeys(jdbc);
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

  private void ensureIssueKeyColumns(JdbcTemplate jdbc) {
    if (!columnExists(jdbc, "projects", "project_key")) {
      jdbc.execute("ALTER TABLE projects ADD COLUMN project_key VARCHAR(10)");
      log.info("Added projects.project_key column");
    }
    if (!columnExists(jdbc, "projects", "issue_counter")) {
      jdbc.execute("ALTER TABLE projects ADD COLUMN issue_counter BIGINT NOT NULL DEFAULT 0");
      log.info("Added projects.issue_counter column");
    }
    if (!columnExists(jdbc, "issues", "issue_key")) {
      jdbc.execute("ALTER TABLE issues ADD COLUMN issue_key VARCHAR(20)");
      log.info("Added issues.issue_key column");
    }
  }

  private void backfillProjectAndIssueKeys(JdbcTemplate jdbc) {
    Set<String> usedKeys =
        new HashSet<>(
            jdbc.queryForList(
                "SELECT project_key FROM projects WHERE project_key IS NOT NULL AND project_key <> ''",
                String.class));

    List<Map<String, Object>> projectsWithoutKey =
        jdbc.queryForList(
            "SELECT id, name FROM projects WHERE project_key IS NULL OR project_key = '' ORDER BY id");

    for (Map<String, Object> row : projectsWithoutKey) {
      Long projectId = ((Number) row.get("id")).longValue();
      String name = (String) row.get("name");
      String projectKey = allocateUniqueProjectKey(name, usedKeys);
      usedKeys.add(projectKey);
      jdbc.update(
          "UPDATE projects SET project_key = ?, issue_counter = COALESCE(issue_counter, 0) WHERE id = ?",
          projectKey,
          projectId);
      log.info("Backfilled project_key {} for project id={}", projectKey, projectId);
    }

    List<Map<String, Object>> projects =
        jdbc.queryForList(
            "SELECT id, project_key, issue_counter FROM projects WHERE project_key IS NOT NULL ORDER BY id");

    for (Map<String, Object> project : projects) {
      Long projectId = ((Number) project.get("id")).longValue();
      String projectKey = (String) project.get("project_key");
      long counter =
          project.get("issue_counter") != null
              ? ((Number) project.get("issue_counter")).longValue()
              : 0L;

      List<Long> issueIds =
          jdbc.queryForList(
              "SELECT id FROM issues WHERE project_id = ? AND (issue_key IS NULL OR issue_key = '') ORDER BY id",
              Long.class,
              projectId);

      for (Long issueId : issueIds) {
        counter++;
        String issueKey = projectKey + "-" + counter;
        jdbc.update("UPDATE issues SET issue_key = ? WHERE id = ?", issueKey, issueId);
      }

      if (!issueIds.isEmpty()) {
        jdbc.update("UPDATE projects SET issue_counter = ? WHERE id = ?", counter, projectId);
        log.info("Backfilled {} issue keys for project {}", issueIds.size(), projectKey);
      }
    }
  }

  private String allocateUniqueProjectKey(String projectName, Set<String> usedKeys) {
    String base = ProjectKeyUtil.deriveBaseKey(projectName);
    String candidate = base;
    int suffix = 1;
    while (usedKeys.contains(candidate)) {
      candidate = base + suffix++;
    }
    return candidate.length() > 10 ? candidate.substring(0, 10) : candidate;
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
