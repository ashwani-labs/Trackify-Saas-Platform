package com.trackify.tenant.service;

import com.trackify.common.enums.Role;
import com.trackify.common.enums.TenantStatus;
import com.trackify.common.enums.UserStatus;
import com.trackify.common.exception.AppException;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.dto.UpdateTenantStatusRequest;
import com.trackify.tenant.dto.UserRegistrationRequest;
import com.trackify.tenant.dto.UserResponse;
import com.trackify.tenant.entity.Tenant;
import com.trackify.tenant.entity.UserLookup;
import com.trackify.tenant.repository.TenantRepository;
import com.trackify.tenant.repository.UserLookupRepository;
import java.sql.Timestamp;
import java.util.UUID;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

  private final TenantRepository tenantRepository;
  private final UserLookupRepository userLookupRepository;
  private final JdbcTemplate jdbcTemplate;
  private final PasswordEncoder passwordEncoder;

  @Value("${tenant.datasource.default-host:localhost}")
  private String defaultDbHost;

  @Value("${services.notification-url:http://localhost:8084}")
  private String notificationUrl;

  @Value("${tenant.app-url-pattern:http://%s.trackify.com:5174}")
  private String appUrlPattern;

  @Transactional
  public TenantResponse createTenant(CreateTenantRequest request) {
    if (tenantRepository.existsByDomain(request.getCode())) {
      throw AppException.conflict("Code already exists");
    }

    String dbName = "trackify_tenant_" + request.getCode();
    String dbUsername = request.getCode() + "_admin";

    String dbPassword = "pw_" + System.currentTimeMillis();
    String adminPassword = UUID.randomUUID().toString().substring(0, 10);

    Tenant tenant =
        Tenant.builder()
            .name(request.getName())
            .domain(request.getCode())
            .plan(
                request.getPlan() != null ? request.getPlan() : com.trackify.common.enums.Plan.FREE)
            .status(TenantStatus.ACTIVE)
            .dbName(dbName)
            .dbHost(defaultDbHost)
            .dbPort(3306)
            .dbUsername(dbUsername)
            .dbPassword(dbPassword)
            .build();

    tenant = tenantRepository.save(tenant);

    provisionTenantDatabase(dbName, dbUsername, dbPassword, request.getAdminEmail(), adminPassword);

    UserLookup userLookup =
        UserLookup.builder().email(request.getAdminEmail()).tenantId(tenant.getId()).build();
    userLookupRepository.save(userLookup);

    sendWelcomeEmail(request.getAdminEmail(), request.getName(), adminPassword, request.getCode());

    return mapToResponse(tenant);
  }

  @Transactional
  public void deleteTenant(Long id) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound("Tenant not found"));

    if (tenant.getStatus() != TenantStatus.INACTIVE) {
      throw AppException.badRequest("Only INACTIVE organizations can be deleted permanently");
    }

    log.info("Deleting tenant {} (Domain: {}) permanently", tenant.getName(), tenant.getDomain());

    // 1. Drop the tenant database
    try {
      jdbcTemplate.execute("DROP DATABASE IF EXISTS " + tenant.getDbName());
    } catch (Exception e) {
      log.error("Failed to drop database {}: {}", tenant.getDbName(), e.getMessage());
      // Proceeding with metadata deletion even if DB drop fails (it might not have been created)
    }

    // 2. Delete user lookups
    userLookupRepository.deleteByTenantId(id);

    // 3. Delete tenant record
    tenantRepository.delete(tenant);
    
    log.info("Tenant {} deleted successfully", tenant.getName());
  }

  public Page<TenantResponse> getAllTenants(Pageable pageable) {
    return tenantRepository.findAll(pageable).map(this::mapToResponse);
  }

  public TenantResponse getTenantById(Long id) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound("Tenant not found"));
    return mapToResponse(tenant);
  }

  @Transactional
  public TenantResponse updateTenantStatus(Long id, UpdateTenantStatusRequest request) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound("Tenant not found"));

    tenant.setStatus(request.getStatus());
    tenant = tenantRepository.save(tenant);
    return mapToResponse(tenant);
  }

  @Transactional
  public UserResponse registerUser(UserRegistrationRequest request) {
    // 1. Check if user already exists
    if (userLookupRepository.findByEmail(request.getEmail()).isPresent()) {
      throw AppException.conflict("A user with this email already exists");
    }

    // 2. Fetch Tenant
    Tenant tenant =
        tenantRepository
            .findById(request.getTenantId())
            .orElseThrow(() -> AppException.notFound("Tenant not found"));

    if (tenant.getStatus() != TenantStatus.ACTIVE) {
      throw AppException.forbidden("Tenant is not active");
    }

    // 3. Insert into User Lookup (Master DB)
    UserLookup lookup =
        UserLookup.builder().email(request.getEmail()).tenantId(tenant.getId()).build();
    userLookupRepository.save(lookup);

    // 4. Insert into Tenant Database (Status: PENDING)
    String hashedPassword = passwordEncoder.encode(request.getPassword());
    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);

    try {
      String sql =
          "INSERT INTO users (email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?)";
      tenantJdbc.update(
          sql,
          request.getEmail(),
          hashedPassword,
          request.getFullName(),
          Role.USER.name(),
          UserStatus.PENDING.name());

      Map<String, Object> userMap =
          tenantJdbc.queryForMap("SELECT * FROM users WHERE email = ?", request.getEmail());
      return mapToUserResponse(userMap, tenant.getId());
    } catch (Exception e) {
      log.error("Failed to register user in tenant DB: {}", e.getMessage());
      throw AppException.internalError("Registration failed");
    }
  }

  public Page<UserResponse> getPendingUsers(Long tenantId, Pageable pageable) {
    Tenant tenant =
        tenantRepository.findById(tenantId).orElseThrow(() -> AppException.notFound("Tenant not found"));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    Long total = tenantJdbc.queryForObject("SELECT COUNT(*) FROM users WHERE status = 'PENDING'", Long.class);

    String sql = "SELECT * FROM users WHERE status = 'PENDING' LIMIT ? OFFSET ?";
    List<Map<String, Object>> users =
        tenantJdbc.queryForList(sql, pageable.getPageSize(), pageable.getOffset());

    List<UserResponse> userResponses = users.stream()
        .map(map -> mapToUserResponse(map, tenantId))
        .collect(Collectors.toList());

    return new org.springframework.data.domain.PageImpl<>(userResponses, pageable, total != null ? total : 0);
  }

  public Page<UserResponse> getAllUsers(Long tenantId, Pageable pageable) {
    Tenant tenant =
        tenantRepository.findById(tenantId).orElseThrow(() -> AppException.notFound("Tenant not found"));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    Long total = tenantJdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class);

    String sql = "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?";
    List<Map<String, Object>> users =
        tenantJdbc.queryForList(sql, pageable.getPageSize(), pageable.getOffset());

    List<UserResponse> userResponses = users.stream()
        .map(map -> mapToUserResponse(map, tenantId))
        .collect(Collectors.toList());

    return new org.springframework.data.domain.PageImpl<>(userResponses, pageable, total != null ? total : 0);
  }

  @Transactional
  public UserResponse updateUserStatus(Long tenantId, Long userId, UserStatus status) {
    Tenant tenant =
        tenantRepository.findById(tenantId).orElseThrow(() -> AppException.notFound("Tenant not found"));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    try {
      tenantJdbc.update("UPDATE users SET status = ? WHERE id = ?", status.name(), userId);
      Map<String, Object> userMap =
          tenantJdbc.queryForMap("SELECT * FROM users WHERE id = ?", userId);
          
      if (status == UserStatus.ACTIVE) {
          sendApprovalEmail(
              (String) userMap.get("email"), 
              (String) userMap.get("full_name")
          );
      }
          
      return mapToUserResponse(userMap, tenantId);
    } catch (Exception e) {
      log.error("Failed to update user status: {}", e.getMessage());
      throw AppException.internalError("Status update failed");
    }
  }

  private void sendApprovalEmail(String email, String fullName) {
    try {
      org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
      java.util.Map<String, String> request = new java.util.HashMap<>();
      request.put("to", email);
      request.put("subject", "Account Approved");
      request.put("body", "Hello " + fullName + ",\n\nYour account has been approved. You can now log in.\n\nBest,\nTrackify Team");
      
      org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(notificationUrl + "/api/notifications/email", request, String.class);
      log.info("Approval email response status: {}", response.getStatusCode());
    } catch (Exception e) {
      log.error("Failed to send approval email to notification service: {} (URL: {})", e.getMessage(), notificationUrl);
    }
  }

  private void sendWelcomeEmail(String email, String tenantName, String password, String domain) {
    try {
      org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
      java.util.Map<String, String> request = new java.util.HashMap<>();
      request.put("to", email);
      request.put("subject", "Welcome to Trackify - Your Cloud Instance is Ready!");
      
      String tenantUrl = String.format(appUrlPattern, domain);
      
      String body = String.format(
          "Hello,\n\n" +
          "Your Trackify instance for '%s' has been successfully provisioned.\n\n" +
          "Login Details:\n" +
          "Domain: %s\n" +
          "Email: %s\n" +
          "Password: %s\n\n" +
          "You can access your instance at: %s\n\n" +
          "Please change your password after your first login.\n\n" +
          "Best Regards,\n" +
          "The Trackify Team",
          tenantName, domain, email, password, tenantUrl
      );
      
      request.put("body", body);
      
      org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(notificationUrl + "/api/notifications/email", request, String.class);
      log.info("Welcome email response status: {}", response.getStatusCode());
      log.info("Welcome email sent to: {}", email);
    } catch (Exception e) {
      log.error("Failed to send welcome email to notification service: {} (URL: {})", e.getMessage(), notificationUrl);
    }
  }

  private JdbcTemplate getTenantJdbcTemplate(Tenant tenant) {
    String dbUrl =
        String.format(
            "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
            tenant.getDbHost(), tenant.getDbPort(), tenant.getDbName());

    DriverManagerDataSource dataSource = new DriverManagerDataSource();
    dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
    dataSource.setUrl(dbUrl);
    dataSource.setUsername(tenant.getDbUsername());
    dataSource.setPassword(tenant.getDbPassword());

    return new JdbcTemplate(dataSource);
  }

  private UserResponse mapToUserResponse(Map<String, Object> map, Long tenantId) {
    return UserResponse.builder()
        .id((Long) map.get("id"))
        .email((String) map.get("email"))
        .fullName((String) map.get("full_name"))
        .role(Role.valueOf((String) map.get("role")))
        .status(UserStatus.valueOf((String) map.get("status")))
        .createdAt(((Timestamp) map.get("created_at")).toLocalDateTime())
        .tenantId(tenantId)
        .build();
  }

  private void provisionTenantDatabase(
      String dbName, String dbUsername, String dbPassword, String adminEmail, String adminPassword) {
    try {
      log.info("Provisioning database: {}", dbName);
      
      // 1. Create Database and User with root privileges
      jdbcTemplate.execute("CREATE DATABASE IF NOT EXISTS " + dbName);
      jdbcTemplate.execute(
          String.format("CREATE USER IF NOT EXISTS '%s'@'%%' IDENTIFIED BY '%s'", dbUsername, dbPassword));
      jdbcTemplate.execute(
          String.format("GRANT ALL PRIVILEGES ON %s.* TO '%s'@'%%'", dbName, dbUsername));
      jdbcTemplate.execute("FLUSH PRIVILEGES");

      // 2. Create Schema using the same root connection (prefixed with dbName)
      String schemaSql = String.format(
          """
                CREATE TABLE IF NOT EXISTS %s.users (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  email        VARCHAR(255) NOT NULL UNIQUE,
                  password     VARCHAR(255) NOT NULL,
                  full_name    VARCHAR(255),
                  role         ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
                  status       ENUM('PENDING','ACTIVE','INACTIVE') DEFAULT 'PENDING',
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS %s.projects (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  name         VARCHAR(255) NOT NULL,
                  description  TEXT,
                  owner_id     BIGINT,
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS %s.issues (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  title        VARCHAR(255) NOT NULL,
                  description  TEXT,
                  status       ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED') DEFAULT 'TODO',
                  priority     ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
                  project_id   BIGINT NOT NULL,
                  reporter_id  BIGINT,
                  assignee_id  BIGINT,
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (project_id) REFERENCES %s.projects(id)
                );

                CREATE TABLE IF NOT EXISTS %s.issue_comments (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  issue_id     BIGINT NOT NULL,
                  user_id      BIGINT,
                  content      TEXT NOT NULL,
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (issue_id) REFERENCES %s.issues(id)
                );

                CREATE TABLE IF NOT EXISTS %s.project_members (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  project_id   BIGINT NOT NULL,
                  user_id      BIGINT NOT NULL,
                  user_email   VARCHAR(255),
                  user_name    VARCHAR(255),
                  user_role    VARCHAR(50) DEFAULT 'USER',
                  added_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
                  UNIQUE KEY uq_project_user (project_id, user_id),
                  FOREIGN KEY (project_id) REFERENCES %s.projects(id)
                );

                CREATE TABLE IF NOT EXISTS %s.password_reset_tokens (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  email        VARCHAR(255) NOT NULL,
                  token        VARCHAR(255) NOT NULL UNIQUE,
                  expires_at   DATETIME NOT NULL,
                  used         BOOLEAN DEFAULT FALSE,
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """,
          dbName, dbName, dbName, dbName, dbName, dbName
      );
      
      // Split and execute individual statements using the ROOT jdbcTemplate
      for (String sql : schemaSql.split(";")) {
          if (!sql.trim().isEmpty()) {
              jdbcTemplate.execute(sql.trim());
          }
      }

      // 3. Create Admin User
      String hashedPassword = passwordEncoder.encode(adminPassword);
      String insertAdminUser = String.format(
          "INSERT INTO %s.users (email, password, full_name, role, status) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')", 
          dbName
      );
      
      jdbcTemplate.update(insertAdminUser, adminEmail, hashedPassword, "Admin User");

      log.info("Provisioned database successfully: {}", dbName);
    } catch (Exception e) {
      log.error("Failed to provision database {}: {}", dbName, e.getMessage());
      throw AppException.internalError("Failed to provision tenant database: " + e.getMessage());
    }
  }

  private TenantResponse mapToResponse(Tenant tenant) {
    return TenantResponse.builder()
        .id(tenant.getId())
        .name(tenant.getName())
        .domain(tenant.getDomain())
        .plan(tenant.getPlan())
        .status(tenant.getStatus())
        .createdAt(tenant.getCreatedAt())
        .updatedAt(tenant.getUpdatedAt())
        .build();
  }
}
