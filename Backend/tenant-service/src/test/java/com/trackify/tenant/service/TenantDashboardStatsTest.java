package com.trackify.tenant.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.trackify.common.enums.TenantStatus;
import com.trackify.tenant.dto.TenantDashboardStatsResponse;
import com.trackify.tenant.entity.Tenant;
import com.trackify.tenant.repository.TenantRepository;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantDashboardStatsTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
  @Mock private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
  @Mock private com.trackify.tenant.repository.UserLookupRepository userLookupRepository;
  @Mock private com.trackify.tenant.client.ProjectNotificationClient projectNotificationClient;

  @InjectMocks private TenantService tenantService;

  @Test
  void getDashboardStats_returnsCumulativeGrowthSeries() {
    YearMonth thisMonth = YearMonth.now();
    YearMonth lastMonth = thisMonth.minusMonths(1);

    Tenant older =
        Tenant.builder()
            .id(1L)
            .name("Alpha")
            .domain("alpha")
            .status(TenantStatus.ACTIVE)
            .createdAt(lastMonth.atDay(5).atStartOfDay())
            .build();
    Tenant newer =
        Tenant.builder()
            .id(2L)
            .name("Beta")
            .domain("beta")
            .status(TenantStatus.ACTIVE)
            .createdAt(thisMonth.atDay(10).atStartOfDay())
            .build();

    when(tenantRepository.count()).thenReturn(2L);
    when(tenantRepository.countByStatus(TenantStatus.ACTIVE)).thenReturn(2L);
    when(tenantRepository.countByStatus(TenantStatus.INACTIVE)).thenReturn(0L);
    when(tenantRepository.findAll()).thenReturn(List.of(older, newer));

    TenantDashboardStatsResponse stats = tenantService.getDashboardStats(2);

    assertEquals(2L, stats.getTotalTenants());
    assertEquals(2, stats.getGrowth().size());
    assertEquals(1L, stats.getGrowth().get(0).getCount());
    assertEquals(2L, stats.getGrowth().get(1).getCount());
  }
}
