package com.trackify.project.service;

import com.trackify.common.enums.Plan;
import com.trackify.common.exception.AppException;
import com.trackify.project.config.TenantContext;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class TenantPlanService {

  private final JdbcTemplate masterJdbcTemplate;
  private final Map<Long, Plan> planCache = new ConcurrentHashMap<>();

  public TenantPlanService(@Qualifier("masterJdbcTemplate") JdbcTemplate masterJdbcTemplate) {
    this.masterJdbcTemplate = masterJdbcTemplate;
  }

  public Plan getCurrentTenantPlan() {
    Long tenantId = TenantContext.get();
    if (tenantId == null) {
      throw AppException.forbidden("Tenant context is required");
    }
    return planCache.computeIfAbsent(
        tenantId,
        id -> {
          String planValue =
              masterJdbcTemplate.queryForObject(
                  "SELECT plan FROM tenants WHERE id = ?", String.class, id);
          return planValue != null ? Plan.valueOf(planValue) : Plan.FREE;
        });
  }
}
