package com.trackify.project.config;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
  void upgradeIfNeeded_skipsWhenSprintsSchemaAlreadyPresent() {
    try (var jdbcTemplateMock = mockConstruction(JdbcTemplate.class)) {
      JdbcTemplate jdbc = jdbcTemplateMock.constructed().get(0);
      when(jdbc.queryForObject(contains("information_schema.tables"), eq(Integer.class), eq("sprints")))
          .thenReturn(1);
      when(jdbc.queryForObject(
              contains("information_schema.columns"), eq(Integer.class), eq("issues"), eq("sprint_id")))
          .thenReturn(1);

      upgrader.upgradeIfNeeded(1L, dataSource);

      verify(jdbc, never()).execute(contains("CREATE TABLE sprints"));
      verify(jdbc, never()).execute(contains("ADD COLUMN sprint_id"));
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

      upgrader.upgradeIfNeeded(2L, dataSource);

      verify(jdbc).execute(contains("CREATE TABLE sprints"));
      verify(jdbc).execute("ALTER TABLE issues ADD COLUMN sprint_id BIGINT NULL");
    }
  }
}
