package com.trackify.tenant.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.trackify.common.enums.Plan;
import com.trackify.common.enums.TenantStatus;
import com.trackify.common.exception.AppException;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.entity.Tenant;
import com.trackify.tenant.repository.TenantRepository;
import com.trackify.tenant.repository.UserLookupRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class TenantServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private UserLookupRepository userLookupRepository;
  @Mock private JdbcTemplate jdbcTemplate;
  @Mock private PasswordEncoder passwordEncoder;

  @InjectMocks private TenantService tenantService;

  private CreateTenantRequest createRequest;

  @BeforeEach
  void setUp() {
    createRequest = new CreateTenantRequest();
    createRequest.setName("Acme Corp");
    createRequest.setCode("acme");
    createRequest.setAdminEmail("admin@acme.com");
    createRequest.setPlan(Plan.PRO);
  }

  @Test
  void testCreateTenant_Success() {
    when(tenantRepository.existsByDomain("acme")).thenReturn(false);
    when(userLookupRepository.findByEmail("admin@acme.com")).thenReturn(Optional.empty());

    Tenant mockTenant = new Tenant();
    mockTenant.setId(1L);
    mockTenant.setName("Acme Corp");
    mockTenant.setDomain("acme");
    mockTenant.setStatus(TenantStatus.ACTIVE);
    mockTenant.setPlan(Plan.PRO);

    when(tenantRepository.save(any(Tenant.class))).thenReturn(mockTenant);
    when(passwordEncoder.encode(anyString())).thenReturn("hashed-pw");

    // We mock jdbcTemplate.execute to do nothing
    doNothing().when(jdbcTemplate).execute(anyString());
    when(jdbcTemplate.update(anyString(), anyString(), anyString(), anyString())).thenReturn(1);

    TenantResponse response = tenantService.createTenant(createRequest);

    assertNotNull(response);
    assertEquals(1L, response.getId());
    assertEquals("Acme Corp", response.getName());
    assertEquals("acme", response.getDomain());
    verify(tenantRepository, times(1)).save(any(Tenant.class));
    verify(userLookupRepository, times(1)).save(any());
  }

  @Test
  void testCreateTenant_DomainAlreadyExists() {
    when(tenantRepository.existsByDomain("acme")).thenReturn(true);

    AppException ex =
        assertThrows(AppException.class, () -> tenantService.createTenant(createRequest));
    assertEquals("Organization code 'acme' is already taken", ex.getMessage());
  }

  @Test
  void testCreateTenant_ProvisioningFailure_DeletesOrphanTenantAndRethrows() {
    when(tenantRepository.existsByDomain("acme")).thenReturn(false);
    when(userLookupRepository.findByEmail("admin@acme.com")).thenReturn(Optional.empty());

    Tenant savedTenant = new Tenant();
    savedTenant.setId(10L);
    savedTenant.setName("Acme Corp");
    savedTenant.setDomain("acme");
    savedTenant.setStatus(TenantStatus.ACTIVE);
    savedTenant.setPlan(Plan.PRO);
    savedTenant.setDbName("trackify_tenant_acme");
    savedTenant.setDbUsername("acme_admin");
    when(tenantRepository.save(any(Tenant.class))).thenReturn(savedTenant);

    doThrow(new RuntimeException("db provisioning failed")).when(jdbcTemplate).execute(anyString());

    RuntimeException ex =
        assertThrows(RuntimeException.class, () -> tenantService.createTenant(createRequest));

    assertEquals("db provisioning failed", ex.getMessage());
    verify(tenantRepository).delete(savedTenant);
    verify(userLookupRepository, never()).save(any());
  }

  @Test
  void testCreateTenant_ProvisioningFailure_CleanupFailureStillRethrowsOriginal() {
    when(tenantRepository.existsByDomain("acme")).thenReturn(false);
    when(userLookupRepository.findByEmail("admin@acme.com")).thenReturn(Optional.empty());

    Tenant savedTenant = new Tenant();
    savedTenant.setId(11L);
    savedTenant.setName("Acme Corp");
    savedTenant.setDomain("acme");
    savedTenant.setStatus(TenantStatus.ACTIVE);
    savedTenant.setPlan(Plan.PRO);
    savedTenant.setDbName("trackify_tenant_acme");
    savedTenant.setDbUsername("acme_admin");
    when(tenantRepository.save(any(Tenant.class))).thenReturn(savedTenant);

    doThrow(new RuntimeException("provisioning exploded")).when(jdbcTemplate).execute(anyString());
    doThrow(new RuntimeException("cleanup exploded")).when(tenantRepository).delete(savedTenant);

    RuntimeException ex =
        assertThrows(RuntimeException.class, () -> tenantService.createTenant(createRequest));

    // Service should propagate the original provisioning exception even if cleanup also fails.
    assertEquals("provisioning exploded", ex.getMessage());
    verify(tenantRepository).delete(savedTenant);
    verify(userLookupRepository, never()).save(any());
  }
}
