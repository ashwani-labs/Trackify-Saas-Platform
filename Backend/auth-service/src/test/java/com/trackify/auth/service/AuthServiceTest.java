package com.trackify.auth.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.trackify.auth.dto.LoginRequest;
import com.trackify.auth.dto.LoginResponse;
import com.trackify.auth.entity.MasterUser;
import com.trackify.auth.entity.Tenant;
import com.trackify.auth.entity.UserLookup;
import com.trackify.auth.repository.MasterUserRepository;
import com.trackify.auth.repository.TenantRepository;
import com.trackify.auth.repository.UserLookupRepository;
import com.trackify.common.enums.Role;
import com.trackify.common.exception.AppException;
import com.trackify.common.security.JwtUtil;
import java.util.Map;
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
class AuthServiceTest {

  @Mock private MasterUserRepository masterUserRepository;
  @Mock private UserLookupRepository userLookupRepository;
  @Mock private TenantRepository tenantRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtUtil jwtUtil;
  @Mock private JdbcTemplate jdbcTemplate;

  @InjectMocks private AuthService authService;

  private LoginRequest loginRequest;

  @BeforeEach
  void setUp() {
    loginRequest = new LoginRequest();
    loginRequest.setEmail("test@trackify.com");
    loginRequest.setPassword("password123");
  }

  @Test
  void testLogin_TenantUser_Success() {
    // Arrange
    when(masterUserRepository.findByEmail(anyString())).thenReturn(Optional.empty());

    UserLookup lookup = new UserLookup();
    lookup.setEmail("test@trackify.com");
    lookup.setTenantId(1L);
    when(userLookupRepository.findByEmail("test@trackify.com")).thenReturn(Optional.of(lookup));

    Tenant tenant = new Tenant();
    tenant.setId(1L);
    tenant.setDomain("testcorp");
    tenant.setDbName("tenant_testcorp");
    when(tenantRepository.findById(1L)).thenReturn(Optional.of(tenant));

    Map<String, Object> userData =
        Map.of(
            "id", 100L,
            "password", "hashed_password",
            "role", "EMPLOYEE",
            "status", "ACTIVE");
    when(jdbcTemplate.queryForMap(anyString(), eq("test@trackify.com"))).thenReturn(userData);
    when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
    when(jwtUtil.generateToken("test@trackify.com", "EMPLOYEE", 1L, 100L))
        .thenReturn("mock-jwt-token");

    // Act
    LoginResponse response = authService.login(loginRequest);

    // Assert
    assertNotNull(response);
    assertEquals("mock-jwt-token", response.getToken());
    assertEquals("EMPLOYEE", response.getRole());
    assertEquals(1L, response.getTenantId());
    assertEquals("testcorp", response.getDomain());
  }

  @Test
  void testLogin_TenantUser_InvalidPassword() {
    // Arrange
    when(masterUserRepository.findByEmail(anyString())).thenReturn(Optional.empty());

    UserLookup lookup = new UserLookup();
    lookup.setEmail("test@trackify.com");
    lookup.setTenantId(1L);
    when(userLookupRepository.findByEmail("test@trackify.com")).thenReturn(Optional.of(lookup));

    Tenant tenant = new Tenant();
    tenant.setId(1L);
    tenant.setDbName("tenant_testcorp");
    when(tenantRepository.findById(1L)).thenReturn(Optional.of(tenant));

    Map<String, Object> userData =
        Map.of(
            "id", 100L,
            "password", "hashed_password",
            "role", "EMPLOYEE",
            "status", "ACTIVE");
    when(jdbcTemplate.queryForMap(anyString(), eq("test@trackify.com"))).thenReturn(userData);
    when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(false);

    // Act & Assert
    AppException exception =
        assertThrows(AppException.class, () -> authService.login(loginRequest));
    assertEquals("Invalid email or password", exception.getMessage());
  }

  @Test
  void testLogin_TenantUser_InactiveAccount() {
    // Arrange
    when(masterUserRepository.findByEmail(anyString())).thenReturn(Optional.empty());

    UserLookup lookup = new UserLookup();
    lookup.setEmail("test@trackify.com");
    lookup.setTenantId(1L);
    when(userLookupRepository.findByEmail("test@trackify.com")).thenReturn(Optional.of(lookup));

    Tenant tenant = new Tenant();
    tenant.setId(1L);
    tenant.setDbName("tenant_testcorp");
    when(tenantRepository.findById(1L)).thenReturn(Optional.of(tenant));

    Map<String, Object> userData =
        Map.of(
            "id", 100L,
            "password", "hashed_password",
            "role", "EMPLOYEE",
            "status", "INACTIVE");
    when(jdbcTemplate.queryForMap(anyString(), eq("test@trackify.com"))).thenReturn(userData);

    // Act & Assert
    AppException exception =
        assertThrows(AppException.class, () -> authService.login(loginRequest));
    assertEquals("Your account is inactive", exception.getMessage());
  }

  @Test
  void testLogin_MasterUser_InvalidPassword() {
    MasterUser masterUser = MasterUser.builder().id(1L).email("test@trackify.com").build();
    masterUser.setActive(true);
    masterUser.setPassword("hashed_password");
    masterUser.setRole(Role.MASTER);

    when(masterUserRepository.findByEmail("test@trackify.com")).thenReturn(Optional.of(masterUser));
    when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(false);

    AppException exception =
        assertThrows(AppException.class, () -> authService.login(loginRequest));
    assertEquals("Invalid email or password", exception.getMessage());
  }

  @Test
  void testLogin_MasterUser_InactiveAccount() {
    MasterUser masterUser = MasterUser.builder().id(1L).email("test@trackify.com").build();
    masterUser.setActive(false);
    masterUser.setPassword("hashed_password");
    masterUser.setRole(Role.MASTER);

    when(masterUserRepository.findByEmail("test@trackify.com")).thenReturn(Optional.of(masterUser));

    AppException exception =
        assertThrows(AppException.class, () -> authService.login(loginRequest));
    assertEquals("Your account has been deactivated", exception.getMessage());
  }
}
