package com.trackify.tenant.service;

import com.trackify.common.client.EmailNotificationClient;
import com.trackify.common.enums.Role;
import com.trackify.common.enums.TenantStatus;
import com.trackify.common.enums.UserStatus;
import com.trackify.common.exception.AppException;
import com.trackify.common.plan.PlanLimits;
import com.trackify.common.theme.TenantThemes;
import com.trackify.common.util.SafeNames;
import com.trackify.tenant.client.ProjectNotificationClient;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.PlatformAuditLogResponse;
import com.trackify.tenant.dto.TenantDashboardStatsResponse;
import com.trackify.tenant.dto.TenantDetailResponse;
import com.trackify.tenant.dto.TenantGrowthPoint;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.dto.UpdateTenantBrandingRequest;
import com.trackify.tenant.dto.UpdateTenantStatusRequest;
import com.trackify.tenant.dto.UserRegistrationRequest;
import com.trackify.tenant.dto.UserResponse;
import com.trackify.tenant.entity.PlatformAuditLog;
import com.trackify.tenant.entity.Tenant;
import com.trackify.tenant.entity.UserLookup;
import com.trackify.tenant.repository.PlatformAuditLogRepository;
import com.trackify.tenant.repository.TenantRepository;
import com.trackify.tenant.repository.UserLookupRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

  private static final String TENANT_NOT_FOUND = "Tenant not found";
  private static final String SQL_COUNT_USERS = "SELECT COUNT(*) FROM users";
  private static final String COL_CREATED_AT = "created_at";
  private static final String LABEL_DATABASE_NAME = "database name";
  private static final String LABEL_DATABASE_USERNAME = "database username";
  private static final String SQL_DROP_USER_IF_EXISTS = "DROP USER IF EXISTS ";
  private static final String MYSQL_HOST_ANY = "@'%'";
  private static final String MYSQL_HOST_LOCALHOST = "@'localhost'";

  private final TenantRepository tenantRepository;
  private final PlatformAuditLogRepository platformAuditLogRepository;
  private final UserLookupRepository userLookupRepository;
  private final JdbcTemplate jdbcTemplate;
  private final PasswordEncoder passwordEncoder;
  private final ProjectNotificationClient projectNotificationClient;
  private final EmailNotificationClient emailNotificationClient;

  @Value("${tenant.app-url-pattern:http://%s.trackify.com:5174}")
  private String appUrlPattern;

  @Value("${tenant.datasource.default-host:localhost}")
  private String defaultDbHost;

  @Value("${trackify.dev.fixed-admin-password:}")
  private String fixedAdminPassword;

  @Transactional
  public TenantResponse createTenant(CreateTenantRequest request) {
    if (tenantRepository.existsByDomain(request.getCode())) {
      throw AppException.conflict("Organization code '" + request.getCode() + "' is already taken");
    }

    if (userLookupRepository.findByEmail(request.getAdminEmail()).isPresent()) {
      throw AppException.conflict(
          "Admin email '"
              + request.getAdminEmail()
              + "' is already registered with another organization");
    }

    String dbName = "trackify_tenant_" + request.getCode();
    String dbUsername = request.getCode() + "_admin";

    String dbPassword = "pw_" + System.currentTimeMillis();
    String adminPassword =
        org.springframework.util.StringUtils.hasText(fixedAdminPassword)
            ? fixedAdminPassword
            : UUID.randomUUID().toString().substring(0, 10);

    String brandTheme = TenantThemes.normalize(request.getTheme());
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
            .companyName(request.getCompanyName())
            .logoUrl(request.getLogoUrl())
            .brandTheme(brandTheme)
            .primaryColor(TenantThemes.primaryColorFor(brandTheme))
            .build();

    tenant = tenantRepository.save(tenant);

    // Ensure metadata is committed before long-running provisioning
    // This avoids holding locks and handles the implicit commit of DDL better
    log.info(
        "Tenant metadata saved for {}. Starting background provisioning...", request.getCode());

    try {
      provisionTenantDatabase(
          dbName, dbUsername, dbPassword, request.getAdminEmail(), adminPassword);

      UserLookup userLookup =
          UserLookup.builder().email(request.getAdminEmail()).tenantId(tenant.getId()).build();
      userLookupRepository.save(userLookup);

      sendWelcomeEmail(
          request.getAdminEmail(), request.getName(), adminPassword, request.getCode());
    } catch (Exception e) {
      log.error("Failed to fully provision tenant {}: {}", request.getCode(), e.getMessage());
      // Cleanup: Since DDL in provisionTenantDatabase triggered an implicit commit,
      // the Tenant record is now permanently in the DB. We must delete it manually
      // if we want to allow retries with the same organization code.
      try {
        tenantRepository.delete(tenant);
        log.info("Successfully cleaned up orphan tenant record for {}", request.getCode());
      } catch (Exception cleanupEx) {
        log.error(
            "Critical: Failed to cleanup orphan tenant record for {}: {}",
            request.getCode(),
            cleanupEx.getMessage());
      }
      throw e;
    }

    return mapToResponse(tenant);
  }

  @Transactional
  public TenantResponse updateTenantBranding(Long id, UpdateTenantBrandingRequest request) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    if (request.getCompanyName() != null) {
      tenant.setCompanyName(request.getCompanyName().trim());
    }
    if (request.getLogoUrl() != null) {
      String logoUrl = request.getLogoUrl().trim();
      if (!logoUrl.isEmpty() && !logoUrl.startsWith("http://") && !logoUrl.startsWith("https://")) {
        throw AppException.badRequest("Logo URL must start with http:// or https://");
      }
      tenant.setLogoUrl(logoUrl.isEmpty() ? null : logoUrl);
    }
    if (request.getTheme() != null) {
      String theme = TenantThemes.normalize(request.getTheme());
      tenant.setBrandTheme(theme);
      tenant.setPrimaryColor(TenantThemes.primaryColorFor(theme));
    } else if (request.getPrimaryColor() != null) {
      String color = request.getPrimaryColor().trim();
      if (!color.matches("^#[0-9A-Fa-f]{6}$")) {
        throw AppException.badRequest("Primary color must be a hex value like #2563eb");
      }
      tenant.setPrimaryColor(color);
    }

    tenant = tenantRepository.save(tenant);
    recordAudit("BRANDING_UPDATED", null, tenant, "Workspace branding updated");
    return mapToResponse(tenant);
  }

  public Page<PlatformAuditLogResponse> getPlatformAuditLogs(Pageable pageable) {
    return platformAuditLogRepository
        .findAllByOrderByCreatedAtDesc(pageable)
        .map(
            log ->
                PlatformAuditLogResponse.builder()
                    .id(log.getId())
                    .action(log.getAction())
                    .actorEmail(log.getActorEmail())
                    .tenantId(log.getTenantId())
                    .tenantName(log.getTenantName())
                    .details(log.getDetails())
                    .createdAt(log.getCreatedAt())
                    .build());
  }

  private void recordAudit(String action, String actorEmail, Tenant tenant, String details) {
    platformAuditLogRepository.save(
        PlatformAuditLog.builder()
            .action(action)
            .actorEmail(actorEmail)
            .tenantId(tenant != null ? tenant.getId() : null)
            .tenantName(tenant != null ? tenant.getName() : null)
            .details(details)
            .build());
  }

  @Transactional
  public void deleteTenant(Long id) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    if (tenant.getStatus() != TenantStatus.INACTIVE) {
      throw AppException.badRequest("Only INACTIVE organizations can be deleted permanently");
    }

    log.info("Deleting tenant {} (Domain: {}) permanently", tenant.getName(), tenant.getDomain());

    // 1. Drop the tenant database and user
    try {
      String safeDb = SafeNames.requireMysqlIdentifier(tenant.getDbName(), LABEL_DATABASE_NAME);
      String safeUser =
          SafeNames.requireMysqlIdentifier(tenant.getDbUsername(), LABEL_DATABASE_USERNAME);
      dropDatabaseIfExists(safeDb);
      dropMysqlUserHosts(safeUser);
      flushPrivileges();
    } catch (Exception e) {
      log.error("Failed to drop database or user for {}: {}", tenant.getDbName(), e.getMessage());
      // Proceeding with metadata deletion even if DB drop fails (it might not have been created)
    }

    // 2. Delete user lookups
    userLookupRepository.deleteByTenantId(id);

    // 3. Delete tenant record
    tenantRepository.delete(tenant);
    recordAudit("TENANT_DELETED", null, tenant, "Organization permanently deleted");

    log.info("Tenant {} deleted successfully", tenant.getName());
  }

  public Page<TenantResponse> getAllTenants(Pageable pageable) {
    return tenantRepository.findAll(pageable).map(this::mapToResponse);
  }

  public TenantDashboardStatsResponse getDashboardStats(int months) {
    int effectiveMonths = Math.min(Math.max(months, 1), 24);
    long total = tenantRepository.count();
    long active = tenantRepository.countByStatus(TenantStatus.ACTIVE);
    long inactive = tenantRepository.countByStatus(TenantStatus.INACTIVE);

    List<Tenant> tenants = tenantRepository.findAll();
    YearMonth start = YearMonth.now(ZoneOffset.UTC).minusMonths(effectiveMonths - 1L);
    DateTimeFormatter labelFormat = DateTimeFormatter.ofPattern("MMM yy");
    List<TenantGrowthPoint> growth = new ArrayList<>();
    List<TenantGrowthPoint> provisioning = new ArrayList<>();

    for (YearMonth cursor = start;
        !cursor.isAfter(YearMonth.now(ZoneOffset.UTC));
        cursor = cursor.plusMonths(1)) {
      LocalDateTime startOfMonth = cursor.atDay(1).atStartOfDay();
      LocalDateTime endOfMonth = cursor.atEndOfMonth().atTime(23, 59, 59);
      long cumulative =
          tenants.stream()
              .filter(
                  tenant ->
                      tenant.getCreatedAt() != null && !tenant.getCreatedAt().isAfter(endOfMonth))
              .count();
      long newTenants =
          tenants.stream()
              .filter(
                  tenant ->
                      tenant.getCreatedAt() != null
                          && !tenant.getCreatedAt().isBefore(startOfMonth)
                          && !tenant.getCreatedAt().isAfter(endOfMonth))
              .count();
      String label = cursor.format(labelFormat);
      growth.add(TenantGrowthPoint.builder().label(label).count(cumulative).build());
      provisioning.add(TenantGrowthPoint.builder().label(label).count(newTenants).build());
    }

    return TenantDashboardStatsResponse.builder()
        .totalTenants(total)
        .activeTenants(active)
        .inactiveTenants(inactive)
        .growth(growth)
        .provisioning(provisioning)
        .build();
  }

  public TenantResponse getTenantById(Long id) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));
    return mapToResponse(tenant);
  }

  public TenantDetailResponse getTenantDetail(Long id) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    long totalUsers = 0;
    long activeUsers = 0;
    long pendingUsers = 0;
    long totalProjects = 0;
    long totalIssues = 0;
    long activeSprints = 0;

    try {
      JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
      Long total = tenantJdbc.queryForObject(SQL_COUNT_USERS, Long.class);
      Long active =
          tenantJdbc.queryForObject(SQL_COUNT_USERS + " WHERE status = 'ACTIVE'", Long.class);
      Long pending =
          tenantJdbc.queryForObject(SQL_COUNT_USERS + " WHERE status = 'PENDING'", Long.class);
      Long projects = tenantJdbc.queryForObject("SELECT COUNT(*) FROM projects", Long.class);
      Long issues = tenantJdbc.queryForObject("SELECT COUNT(*) FROM issues", Long.class);
      Long sprints =
          tenantJdbc.queryForObject(
              "SELECT COUNT(*) FROM sprints WHERE status = 'ACTIVE'", Long.class);
      totalUsers = total != null ? total : 0;
      activeUsers = active != null ? active : 0;
      pendingUsers = pending != null ? pending : 0;
      totalProjects = projects != null ? projects : 0;
      totalIssues = issues != null ? issues : 0;
      activeSprints = sprints != null ? sprints : 0;
    } catch (Exception e) {
      log.warn("Could not load usage stats for tenant {}: {}", tenant.getDomain(), e.getMessage());
    }

    return TenantDetailResponse.builder()
        .id(tenant.getId())
        .name(tenant.getName())
        .domain(tenant.getDomain())
        .plan(tenant.getPlan())
        .status(tenant.getStatus())
        .createdAt(tenant.getCreatedAt())
        .updatedAt(tenant.getUpdatedAt())
        .companyName(tenant.getCompanyName())
        .logoUrl(tenant.getLogoUrl())
        .primaryColor(tenant.getPrimaryColor())
        .brandTheme(tenant.getBrandTheme())
        .dbName(tenant.getDbName())
        .dbHost(tenant.getDbHost())
        .dbPort(tenant.getDbPort())
        .totalUsers(totalUsers)
        .activeUsers(activeUsers)
        .pendingUsers(pendingUsers)
        .totalProjects(totalProjects)
        .totalIssues(totalIssues)
        .activeSprints(activeSprints)
        .build();
  }

  @Transactional
  public TenantResponse updateTenantStatus(Long id, UpdateTenantStatusRequest request) {
    Tenant tenant =
        tenantRepository.findById(id).orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    tenant.setStatus(request.getStatus());
    tenant = tenantRepository.save(tenant);
    recordAudit(
        "TENANT_STATUS_UPDATED", null, tenant, "Status changed to " + request.getStatus().name());
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
            .orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    if (tenant.getStatus() != TenantStatus.ACTIVE) {
      throw AppException.forbidden("Tenant is not active");
    }

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    Long existingUsers = tenantJdbc.queryForObject(SQL_COUNT_USERS, Long.class);
    if (existingUsers != null && existingUsers >= PlanLimits.maxUsers(tenant.getPlan())) {
      throw AppException.forbidden("User seat limit reached for your subscription plan.");
    }

    // 3. Insert into User Lookup (Master DB)
    UserLookup lookup =
        UserLookup.builder().email(request.getEmail()).tenantId(tenant.getId()).build();
    userLookupRepository.save(lookup);

    // 4. Insert into Tenant Database
    String hashedPassword = passwordEncoder.encode(request.getPassword());

    UserStatus initialStatus = UserStatus.PENDING;
    if (request.getStatus() != null) {
      try {
        initialStatus = UserStatus.valueOf(request.getStatus().toUpperCase());
      } catch (IllegalArgumentException e) {
        log.warn(
            "Invalid status provided in registration: {}, defaulting to PENDING",
            request.getStatus());
      }
    }

    try {
      String sql =
          "INSERT INTO users (email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?)";
      tenantJdbc.update(
          sql,
          request.getEmail(),
          hashedPassword,
          request.getFullName(),
          Role.USER.name(),
          initialStatus.name());

      Map<String, Object> userMap =
          tenantJdbc.queryForMap("SELECT * FROM users WHERE email = ?", request.getEmail());

      // Trigger invitation email if ACTIVE (direct add by admin)
      if (initialStatus == UserStatus.ACTIVE) {
        sendInviteEmail(
            request.getEmail(), tenant.getName(), request.getPassword(), tenant.getDomain());
      } else if (initialStatus == UserStatus.PENDING) {
        Long pendingUserId = ((Number) userMap.get("id")).longValue();
        projectNotificationClient.notifyUserApprovalPending(
            tenant.getId(), pendingUserId, request.getEmail(), request.getFullName());
      }

      return mapToUserResponse(userMap, tenant.getId());
    } catch (Exception e) {
      log.error("Failed to register user in tenant DB: {}", e.getMessage());
      throw AppException.internalError("Registration failed");
    }
  }

  public Page<UserResponse> getPendingUsers(Long tenantId, Pageable pageable) {
    Tenant tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    Long total =
        tenantJdbc.queryForObject(SQL_COUNT_USERS + " WHERE status = 'PENDING'", Long.class);

    String sql = "SELECT * FROM users WHERE status = 'PENDING' LIMIT ? OFFSET ?";
    List<Map<String, Object>> users =
        tenantJdbc.queryForList(sql, pageable.getPageSize(), pageable.getOffset());

    List<UserResponse> userResponses =
        users.stream().map(map -> mapToUserResponse(map, tenantId)).toList();

    return new org.springframework.data.domain.PageImpl<>(
        userResponses, pageable, total != null ? total : 0);
  }

  public Page<UserResponse> getAllUsers(Long tenantId, Pageable pageable) {
    Tenant tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    Long total = tenantJdbc.queryForObject(SQL_COUNT_USERS, Long.class);

    String sql = "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?";
    List<Map<String, Object>> users =
        tenantJdbc.queryForList(sql, pageable.getPageSize(), pageable.getOffset());

    List<UserResponse> userResponses =
        users.stream().map(map -> mapToUserResponse(map, tenantId)).toList();

    return new org.springframework.data.domain.PageImpl<>(
        userResponses, pageable, total != null ? total : 0);
  }

  @Transactional
  public UserResponse updateUserStatus(Long tenantId, Long userId, UserStatus status) {
    Tenant tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AppException.notFound(TENANT_NOT_FOUND));

    JdbcTemplate tenantJdbc = getTenantJdbcTemplate(tenant);
    try {
      tenantJdbc.update("UPDATE users SET status = ? WHERE id = ?", status.name(), userId);
      Map<String, Object> userMap =
          tenantJdbc.queryForMap("SELECT * FROM users WHERE id = ?", userId);

      if (status == UserStatus.ACTIVE) {
        sendApprovalEmail((String) userMap.get("email"), (String) userMap.get("full_name"));
      }

      return mapToUserResponse(userMap, tenantId);
    } catch (Exception e) {
      log.error("Failed to update user status: {}", e.getMessage());
      throw AppException.internalError("Status update failed");
    }
  }

  private void sendApprovalEmail(String email, String fullName) {
    emailNotificationClient.send(
        email,
        "Account Approved",
        """
        Hello %s,

        Your account has been approved. You can now log in.

        Best,
        Trackify Team
        """
            .formatted(fullName));
  }

  private void sendInviteEmail(String email, String tenantName, String password, String domain) {
    String tenantUrl = String.format(appUrlPattern, domain);
    String body =
        """
        Hello,

        You have been added as a team member to '%s' on Trackify.

        Login Details:
        App URL: %s
        Email: %s
        Temporary Password: %s

        Please log in and change your password after your first login.

        Best,
        The Trackify Team
        """
            .formatted(tenantName, tenantUrl, email, password);
    emailNotificationClient.send(
        email, "You've been invited to join " + tenantName + " on Trackify", body);
  }

  private void sendWelcomeEmail(String email, String tenantName, String password, String domain) {
    String tenantUrl = String.format(appUrlPattern, domain);
    String body =
        """
        Hello,

        Your Trackify instance for '%s' has been successfully provisioned.

        Login Details:
        Domain: %s
        Email: %s
        Password: %s

        You can access your instance at: %s

        Please change your password after your first login.

        Best Regards,
        The Trackify Team
        """
            .formatted(tenantName, domain, email, password, tenantUrl);
    emailNotificationClient.send(
        email, "Welcome to Trackify - Your Cloud Instance is Ready!", body);
  }

  private JdbcTemplate getTenantJdbcTemplate(Tenant tenant) {
    String safeDb = SafeNames.requireMysqlIdentifier(tenant.getDbName(), LABEL_DATABASE_NAME);
    String dbUrl =
        String.format(
            "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
            tenant.getDbHost(), tenant.getDbPort(), safeDb);

    DriverManagerDataSource dataSource = new DriverManagerDataSource();
    dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
    dataSource.setUrl(dbUrl);
    dataSource.setUsername(tenant.getDbUsername());
    dataSource.setPassword(tenant.getDbPassword());

    return new JdbcTemplate(dataSource);
  }

  private UserResponse mapToUserResponse(Map<String, Object> map, Long tenantId) {
    Object created = map.get(COL_CREATED_AT);
    LocalDateTime createdAt =
        created instanceof Timestamp timestamp
            ? timestamp.toLocalDateTime()
            : (LocalDateTime) created;
    return UserResponse.builder()
        .id((Long) map.get("id"))
        .email((String) map.get("email"))
        .fullName((String) map.get("full_name"))
        .role(Role.valueOf((String) map.get("role")))
        .status(UserStatus.valueOf((String) map.get("status")))
        .createdAt(createdAt)
        .tenantId(tenantId)
        .build();
  }

  private void provisionTenantDatabase(
      String dbName,
      String dbUsername,
      String dbPassword,
      String adminEmail,
      String adminPassword) {
    try {
      log.info("Provisioning database: {}", dbName);

      String safeDb = SafeNames.requireMysqlIdentifier(dbName, LABEL_DATABASE_NAME);
      String safeUser = SafeNames.requireMysqlIdentifier(dbUsername, LABEL_DATABASE_USERNAME);

      // 1. Create Database and User with root privileges
      createDatabaseIfNotExists(safeDb);

      // Drop and Recreate user to ensure fresh credentials and permissions for both % and localhost
      // This solves the 'stale password' issue when re-provisioning tenants
      dropMysqlUserIfExists(dbUsername);
      createMysqlUserWithPassword(safeUser, dbPassword);
      grantAllOnDatabase(safeDb, safeUser);
      flushPrivileges();

      // 2. Create schema (V1 is the full current schema; legacy DBs upgrade via
      // TenantSchemaUpgrader on connect)
      String schemaSql = loadSqlTemplate("db/tenant/V1__tenant_schema.sql", dbName);
      executeSqlStatements(schemaSql);

      // 3. Create Admin User
      String hashedPassword = passwordEncoder.encode(adminPassword);
      insertTenantAdminUser(safeDb, adminEmail, hashedPassword);

      log.info("Provisioned database successfully: {}", dbName);
    } catch (Exception e) {
      log.error("Failed to provision database {}: {}", dbName, e.getMessage());
      throw AppException.internalError("Failed to provision tenant database: " + e.getMessage());
    }
  }

  private void dropMysqlUserIfExists(String dbUsername) {
    String safeUser = SafeNames.requireMysqlIdentifier(dbUsername, LABEL_DATABASE_USERNAME);
    try {
      dropMysqlUserHosts(safeUser);
    } catch (Exception e) {
      log.warn("Non-critical error dropping user during provisioning: {}", e.getMessage());
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
        .companyName(tenant.getCompanyName())
        .logoUrl(tenant.getLogoUrl())
        .primaryColor(tenant.getPrimaryColor())
        .brandTheme(tenant.getBrandTheme())
        .build();
  }

  private String loadSqlTemplate(String classpathLocation, String dbName) {
    try {
      String safeDb = SafeNames.requireMysqlIdentifier(dbName, LABEL_DATABASE_NAME);
      ClassPathResource resource = new ClassPathResource(classpathLocation);
      String rawSql = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
      return rawSql.replace("{{DB_NAME}}", safeDb);
    } catch (IOException e) {
      throw AppException.internalError(
          "Failed to load tenant schema template: " + classpathLocation);
    }
  }

  /** Identifiers are validated via {@link SafeNames} before concatenation. */
  @SuppressWarnings("java:S2077")
  private void dropDatabaseIfExists(String safeDb) {
    jdbcTemplate.execute("DROP DATABASE IF EXISTS " + safeDb);
  }

  @SuppressWarnings("java:S2077")
  private void createDatabaseIfNotExists(String safeDb) {
    jdbcTemplate.execute("CREATE DATABASE IF NOT EXISTS " + safeDb);
  }

  @SuppressWarnings("java:S2077")
  private void dropMysqlUserHosts(String safeUser) {
    String quotedUser = SafeNames.quoteMysqlLiteral(safeUser);
    jdbcTemplate.execute(SQL_DROP_USER_IF_EXISTS + quotedUser + MYSQL_HOST_ANY);
    jdbcTemplate.execute(SQL_DROP_USER_IF_EXISTS + quotedUser + MYSQL_HOST_LOCALHOST);
  }

  @SuppressWarnings("java:S2077")
  private void createMysqlUserWithPassword(String safeUser, String dbPassword) {
    String quotedUser = SafeNames.quoteMysqlLiteral(safeUser);
    String quotedPassword = SafeNames.quoteMysqlLiteral(dbPassword);
    jdbcTemplate.execute(
        "CREATE USER " + quotedUser + MYSQL_HOST_ANY + " IDENTIFIED BY " + quotedPassword);
    jdbcTemplate.execute(
        "CREATE USER " + quotedUser + MYSQL_HOST_LOCALHOST + " IDENTIFIED BY " + quotedPassword);
  }

  @SuppressWarnings("java:S2077")
  private void grantAllOnDatabase(String safeDb, String safeUser) {
    String quotedUser = SafeNames.quoteMysqlLiteral(safeUser);
    jdbcTemplate.execute(
        "GRANT ALL PRIVILEGES ON " + safeDb + ".* TO " + quotedUser + MYSQL_HOST_ANY);
    jdbcTemplate.execute(
        "GRANT ALL PRIVILEGES ON " + safeDb + ".* TO " + quotedUser + MYSQL_HOST_LOCALHOST);
  }

  private void flushPrivileges() {
    jdbcTemplate.execute("FLUSH PRIVILEGES");
  }

  @SuppressWarnings("java:S2077")
  private void insertTenantAdminUser(String safeDb, String adminEmail, String hashedPassword) {
    jdbcTemplate.update(
        "INSERT INTO "
            + safeDb
            + ".users (email, password, full_name, role, status) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')",
        adminEmail,
        hashedPassword,
        "Admin User");
  }

  @SuppressWarnings("java:S2077")
  private void executeSqlStatements(String sqlScript) {
    for (String sql : sqlScript.split(";")) {
      if (!sql.trim().isEmpty()) {
        jdbcTemplate.execute(sql.trim());
      }
    }
  }
}
