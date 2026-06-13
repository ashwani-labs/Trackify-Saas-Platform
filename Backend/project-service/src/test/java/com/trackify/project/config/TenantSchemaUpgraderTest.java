package com.trackify.project.config;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class TenantSchemaUpgraderTest {

  @Mock private DataSource dataSource;

  private TenantSchemaUpgrader upgrader;

  @BeforeEach
  void setUp() {
    upgrader = new TenantSchemaUpgrader();
  }

  @Test
  void upgradeIfNeeded_skipsWhenSchemaAlreadyPresent() {
    try (var jdbcTemplateMock = mockConstruction(JdbcTemplate.class)) {
      JdbcTemplate jdbc = jdbcTemplateMock.constructed().get(0);
      stubSchemaPresent(jdbc);
      when(jdbc.queryForList(
              eq(
                  "SELECT project_key FROM projects WHERE project_key IS NOT NULL AND project_key <> ''"),
              eq(String.class)))
          .thenReturn(List.of("ALPHA"));
      when(jdbc.queryForList(
              eq("SELECT id, name FROM projects WHERE project_key IS NULL OR project_key = '' ORDER BY id")))
          .thenReturn(List.of());
      when(jdbc.queryForList(
              eq(
                  "SELECT id, project_key, issue_counter FROM projects WHERE project_key IS NOT NULL ORDER BY id")))
          .thenReturn(List.of(Map.of("id", 1L, "project_key", "ALPHA", "issue_counter", 2L)));
      when(jdbc.queryForList(
              eq(
                  "SELECT id FROM issues WHERE project_id = ? AND (issue_key IS NULL OR issue_key = '') ORDER BY id"),
              eq(Long.class),
              eq(1L)))
          .thenReturn(List.of());

      upgrader.upgradeIfNeeded(1L, dataSource);

      verify(jdbc, never()).execute(contains("CREATE TABLE sprints"));
      verify(jdbc, never()).execute(contains("ADD COLUMN sprint_id"));
      verify(jdbc, never()).update(contains("issue_key"), any(), any());
    }
  }

  @Test
  void upgradeIfNeeded_createsSprintsAndAddsIssueColumnWhenMissing() {
    try (var jdbcTemplateMock = mockConstruction(JdbcTemplate.class)) {
      JdbcTemplate jdbc = jdbcTemplateMock.constructed().get(0);
      when(jdbc.queryForObject(contains("information_schema.tables"), eq(Integer.class), eq("sprints")))
          .thenReturn(0, 1);
      when(jdbc.queryForObject(
              contains("information_schema.columns"), eq(Integer.class), eq("issues"), eq("sprint_id")))
          .thenReturn(0);
      stubIssueKeyColumnsPresent(jdbc);
      when(jdbc.queryForList(
              eq(
                  "SELECT project_key FROM projects WHERE project_key IS NOT NULL AND project_key <> ''"),
              eq(String.class)))
          .thenReturn(List.of());
      when(jdbc.queryForList(
              eq("SELECT id, name FROM projects WHERE project_key IS NULL OR project_key = '' ORDER BY id")))
          .thenReturn(List.of());
      when(jdbc.queryForList(
              eq(
                  "SELECT id, project_key, issue_counter FROM projects WHERE project_key IS NOT NULL ORDER BY id")))
          .thenReturn(List.of());

      upgrader.upgradeIfNeeded(2L, dataSource);

      verify(jdbc).execute(contains("CREATE TABLE sprints"));
      verify(jdbc).execute("ALTER TABLE issues ADD COLUMN sprint_id BIGINT NULL");
    }
  }

  @Test
  void upgradeIfNeeded_backfillsMissingProjectAndIssueKeys() {
    try (var jdbcTemplateMock = mockConstruction(JdbcTemplate.class)) {
      JdbcTemplate jdbc = jdbcTemplateMock.constructed().get(0);
      stubSchemaPresent(jdbc);
      when(jdbc.queryForList(
              eq(
                  "SELECT project_key FROM projects WHERE project_key IS NOT NULL AND project_key <> ''"),
              eq(String.class)))
          .thenReturn(List.of());
      when(jdbc.queryForList(
              eq("SELECT id, name FROM projects WHERE project_key IS NULL OR project_key = '' ORDER BY id")))
          .thenReturn(List.of(Map.of("id", 5L, "name", "Alpha Platform")));
      when(jdbc.queryForList(
              eq(
                  "SELECT id, project_key, issue_counter FROM projects WHERE project_key IS NOT NULL ORDER BY id")))
          .thenReturn(List.of(Map.of("id", 5L, "project_key", "ALPHAPLATFO", "issue_counter", 0L)));
      when(jdbc.queryForList(
              eq(
                  "SELECT id FROM issues WHERE project_id = ? AND (issue_key IS NULL OR issue_key = '') ORDER BY id"),
              eq(Long.class),
              eq(5L)))
          .thenReturn(List.of(10L, 11L));

      upgrader.upgradeIfNeeded(3L, dataSource);

      verify(jdbc)
          .update(
              eq(
                  "UPDATE projects SET project_key = ?, issue_counter = COALESCE(issue_counter, 0) WHERE id = ?"),
              eq("ALPHAPLATFO"),
              eq(5L));
      verify(jdbc).update("UPDATE issues SET issue_key = ? WHERE id = ?", "ALPHAPLATFO-1", 10L);
      verify(jdbc).update("UPDATE issues SET issue_key = ? WHERE id = ?", "ALPHAPLATFO-2", 11L);
      verify(jdbc).update("UPDATE projects SET issue_counter = ? WHERE id = ?", 2L, 5L);
    }
  }

  private void stubSchemaPresent(JdbcTemplate jdbc) {
    when(jdbc.queryForObject(contains("information_schema.tables"), eq(Integer.class), eq("sprints")))
        .thenReturn(1);
    when(jdbc.queryForObject(
            contains("information_schema.columns"), eq(Integer.class), eq("issues"), eq("sprint_id")))
        .thenReturn(1);
    stubIssueKeyColumnsPresent(jdbc);
  }

  private void stubIssueKeyColumnsPresent(JdbcTemplate jdbc) {
    when(jdbc.queryForObject(
            contains("information_schema.columns"), eq(Integer.class), eq("projects"), eq("project_key")))
        .thenReturn(1);
    when(jdbc.queryForObject(
            contains("information_schema.columns"), eq(Integer.class), eq("projects"), eq("issue_counter")))
        .thenReturn(1);
    when(jdbc.queryForObject(
            contains("information_schema.columns"), eq(Integer.class), eq("issues"), eq("issue_key")))
        .thenReturn(1);
  }
}
