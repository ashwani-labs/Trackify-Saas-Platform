package com.trackify.auth.service;

import com.trackify.auth.dto.LoginRequest;
import com.trackify.auth.dto.LoginResponse;
import com.trackify.auth.entity.MasterUser;
import com.trackify.auth.entity.Tenant;
import com.trackify.auth.entity.UserLookup;
import com.trackify.auth.repository.MasterUserRepository;
import com.trackify.auth.repository.TenantRepository;
import com.trackify.auth.repository.UserLookupRepository;
import com.trackify.common.exception.AppException;
import com.trackify.common.security.JwtUtil;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private final MasterUserRepository masterUserRepository;
  private final UserLookupRepository userLookupRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final JdbcTemplate jdbcTemplate;

  @Value("${tenant.datasource.host-override:}")
  private String dbHostOverride;

  public LoginResponse login(LoginRequest request) {
    // 1. Try Platform Master User
    Optional<MasterUser> masterUserOpt = masterUserRepository.findByEmail(request.getEmail());
    if (masterUserOpt.isPresent()) {
      MasterUser user = masterUserOpt.get();
      if (!user.isActive()) throw AppException.forbidden("Your account has been deactivated");
      if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw AppException.unauthorized("Invalid email or password");
      }
      String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), null, user.getId());
      return LoginResponse.builder().token(token).role(user.getRole().name()).build();
    }

    // 2. Try Tenant User (via lookup)
    UserLookup lookup =
        userLookupRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> AppException.unauthorized("Invalid email or password"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

    Map<String, Object> userData =
        checkTenantUserCredentials(tenant, request.getEmail(), request.getPassword());

    String role = (String) userData.get("role");
    Long userId = null;
    Object idObj = userData.get("id");
    if (idObj instanceof Integer i) userId = i.longValue();
    else if (idObj instanceof Long l) userId = l;
    
    String token = jwtUtil.generateToken(request.getEmail(), role, tenant.getId(), userId);

    return LoginResponse.builder().token(token).role(role).tenantId(tenant.getId()).build();
  }

  private Map<String, Object> checkTenantUserCredentials(
      Tenant tenant, String email, String password) {
    
    log.info("Authenticating user {} for tenant {} using master connection", email, tenant.getDbName());

    try {
      String sql = String.format(
          "SELECT id, password, role, status FROM %s.users WHERE email = ?", 
          tenant.getDbName()
      );
      
      Map<String, Object> user = jdbcTemplate.queryForMap(sql, email);

      String status = (String) user.get("status");
      if ("INACTIVE".equals(status)) {
        throw AppException.forbidden("Your account is inactive");
      }

      String hashedPassword = (String) user.get("password");
      if (!passwordEncoder.matches(password, hashedPassword)) {
        throw AppException.unauthorized("Invalid email or password");
      }

      return user;
    } catch (Exception e) {
      log.error(
          "Error authenticating against tenant DB {}: {}. Root cause: {}", 
          tenant.getDbName(), e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "N/A");
      throw AppException.unauthorized("Invalid email or password");
    }
  }
}
