package com.trackify.auth.service;

import com.trackify.auth.dto.ChangePasswordRequest;
import com.trackify.auth.dto.ForgotPasswordRequest;
import com.trackify.auth.dto.LoginRequest;
import com.trackify.auth.dto.LoginResponse;
import com.trackify.auth.dto.ResetPasswordRequest;
import com.trackify.auth.entity.MasterUser;
import com.trackify.auth.entity.Tenant;
import com.trackify.auth.entity.UserLookup;
import com.trackify.auth.repository.MasterUserRepository;
import com.trackify.auth.repository.TenantRepository;
import com.trackify.auth.repository.UserLookupRepository;
import com.trackify.common.client.EmailNotificationClient;
import com.trackify.common.exception.AppException;
import com.trackify.common.security.JwtUtil;
import com.trackify.common.theme.TenantThemes;
import com.trackify.common.util.SafeNames;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private static final String INVALID_CREDENTIALS = "Invalid email or password";
  private static final String TENANT_MAPPING_CORRUPTED = "Tenant mapping corrupted";
  private static final String TABLE_USERS = "users";
  private static final String TABLE_PASSWORD_RESET_TOKENS = "password_reset_tokens";
  private static final String SQL_UPDATE = "UPDATE ";

  private final MasterUserRepository masterUserRepository;
  private final UserLookupRepository userLookupRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final JdbcTemplate jdbcTemplate;
  private final EmailNotificationClient emailNotificationClient;

  @Value("${tenant.app-url-pattern:http://%s.trackify.com:5174}")
  private String appUrlPattern;

  public LoginResponse login(LoginRequest request) {
    Optional<MasterUser> masterUserOpt = masterUserRepository.findByEmail(request.getEmail());
    if (masterUserOpt.isPresent()) {
      MasterUser user = masterUserOpt.get();
      if (!user.isActive()) throw AppException.forbidden("Your account has been deactivated");
      if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw AppException.unauthorized(INVALID_CREDENTIALS);
      }
      String token =
          jwtUtil.generateToken(user.getEmail(), user.getRole().name(), null, user.getId());
      return LoginResponse.builder()
          .token(token)
          .role(user.getRole().name())
          .profilePhotoUrl(user.getProfilePhotoUrl())
          .build();
    }

    UserLookup lookup =
        userLookupRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> AppException.unauthorized(INVALID_CREDENTIALS));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError(TENANT_MAPPING_CORRUPTED));

    Map<String, Object> userData =
        checkTenantUserCredentials(tenant, request.getEmail(), request.getPassword());

    String role = (String) userData.get("role");
    Long userId = null;
    Object idObj = userData.get("id");
    if (idObj instanceof Integer i) userId = i.longValue();
    else if (idObj instanceof Long l) userId = l;

    String token = jwtUtil.generateToken(request.getEmail(), role, tenant.getId(), userId);

    return LoginResponse.builder()
        .token(token)
        .role(role)
        .tenantId(tenant.getId())
        .domain(tenant.getDomain())
        .profilePhotoUrl((String) userData.get("profile_photo_url"))
        .companyName(tenant.getCompanyName())
        .logoUrl(tenant.getLogoUrl())
        .primaryColor(tenant.getPrimaryColor())
        .brandTheme(tenant.getBrandTheme() != null ? tenant.getBrandTheme() : TenantThemes.DEFAULT)
        .plan(tenant.getPlan() != null ? tenant.getPlan().name() : null)
        .build();
  }

  private Map<String, Object> checkTenantUserCredentials(
      Tenant tenant, String email, String password) {

    log.info(
        "Authenticating user {} for tenant {} using master connection", email, tenant.getDbName());

    try {
      Map<String, Object> user = queryTenantUserByEmail(qualifiedTable(tenant, TABLE_USERS), email);

      String status = (String) user.get("status");
      if ("INACTIVE".equals(status)) {
        throw AppException.forbidden("Your account is inactive");
      }

      String hashedPassword = (String) user.get("password");
      if (!passwordEncoder.matches(password, hashedPassword)) {
        throw AppException.unauthorized(INVALID_CREDENTIALS);
      }

      return user;
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error(
          "Error authenticating against tenant DB {}: {}. Root cause: {}",
          tenant.getDbName(),
          e.getMessage(),
          e.getCause() != null ? e.getCause().getMessage() : "N/A");
      throw AppException.unauthorized(INVALID_CREDENTIALS);
    }
  }

  public void forgotPassword(ForgotPasswordRequest request) {
    String email = request.getEmail();

    UserLookup lookup =
        userLookupRepository
            .findByEmail(email)
            .orElseThrow(() -> AppException.notFound("No account found with that email address"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError(TENANT_MAPPING_CORRUPTED));

    String token = UUID.randomUUID().toString();
    LocalDateTime expiresAt = LocalDateTime.now(ZoneOffset.UTC).plusHours(1);

    try {
      insertPasswordResetToken(
          qualifiedTable(tenant, TABLE_PASSWORD_RESET_TOKENS), email, token, expiresAt);
    } catch (Exception e) {
      log.error("Failed to insert reset token in tenant DB: {}", e.getMessage());
      throw AppException.internalError("Failed to generate password reset request");
    }

    sendPasswordResetEmail(email, token, tenant.getDomain());
  }

  private void sendPasswordResetEmail(String email, String token, String domain) {
    String resetUrl =
        String.format(appUrlPattern, domain) + "/reset-password?token=" + token + "&email=" + email;

    String body =
        "Hello,\n\nWe received a request to reset your password for your Trackify account.\n\n"
            + "Click the link below to set a new password:\n"
            + resetUrl
            + "\n\n"
            + "If you did not request this, please ignore this email.\n\nBest,\nTrackify Team";

    emailNotificationClient.send(email, "Trackify - Password Reset Request", body);
    log.info("Password reset email requested for {}", email);
  }

  public void resetPassword(ResetPasswordRequest request) {
    UserLookup lookup =
        userLookupRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> AppException.notFound("Invalid reset request"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError(TENANT_MAPPING_CORRUPTED));

    try {
      List<Long> tokens =
          findValidPasswordResetTokenIds(
              qualifiedTable(tenant, TABLE_PASSWORD_RESET_TOKENS),
              request.getEmail(),
              request.getToken());

      if (tokens.isEmpty()) {
        throw AppException.badRequest("Invalid or expired password reset token");
      }

      String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
      updateTenantUserPassword(
          qualifiedTable(tenant, TABLE_USERS), newHashedPassword, request.getEmail());
      markPasswordResetTokenUsed(
          qualifiedTable(tenant, TABLE_PASSWORD_RESET_TOKENS), tokens.get(0));

      log.info("Password successfully reset for {}", request.getEmail());
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error("Failed to process password reset: {}", e.getMessage());
      throw AppException.internalError("Failed to reset password: " + e.getMessage());
    }
  }

  public void changePassword(ChangePasswordRequest request) {
    UserLookup lookup =
        userLookupRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> AppException.notFound("User not found"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError(TENANT_MAPPING_CORRUPTED));

    try {
      String currentHashedPassword =
          selectTenantUserPassword(qualifiedTable(tenant, TABLE_USERS), request.getEmail());

      if (currentHashedPassword == null
          || !passwordEncoder.matches(request.getCurrentPassword(), currentHashedPassword)) {
        throw AppException.unauthorized("Incorrect current password");
      }

      String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
      updateTenantUserPassword(
          qualifiedTable(tenant, TABLE_USERS), newHashedPassword, request.getEmail());

      log.info("Password successfully changed for {}", request.getEmail());
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error("Failed to change password: {}", e.getMessage());
      throw AppException.internalError("Could not update password. Please try again.");
    }
  }

  public void updateProfilePhoto(String email, String photoUrl) {
    Optional<MasterUser> masterUserOpt = masterUserRepository.findByEmail(email);
    if (masterUserOpt.isPresent()) {
      MasterUser user = masterUserOpt.get();
      user.setProfilePhotoUrl(photoUrl);
      masterUserRepository.save(user);
      return;
    }

    UserLookup lookup =
        userLookupRepository
            .findByEmail(email)
            .orElseThrow(() -> AppException.notFound("User not found"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError(TENANT_MAPPING_CORRUPTED));

    try {
      updateTenantUserProfilePhoto(qualifiedTable(tenant, TABLE_USERS), photoUrl, email);
    } catch (Exception e) {
      log.error("Failed to update profile photo: {}", e.getMessage());
      throw AppException.internalError("Could not update profile photo");
    }
  }

  /**
   * Builds {@code db.table} using a validated tenant database name from the master registry (never
   * from request input). Values remain bound via JDBC placeholders.
   */
  private static String qualifiedTable(Tenant tenant, String table) {
    String dbName = SafeNames.requireMysqlIdentifier(tenant.getDbName(), "database name");
    String safeTable = SafeNames.requireMysqlIdentifier(table, "table name");
    return dbName + '.' + safeTable;
  }

  // Dynamic schema/table identifiers are allowlisted via SafeNames; bind values use placeholders.
  @SuppressWarnings("java:S2077")
  private Map<String, Object> queryTenantUserByEmail(String qualifiedUsers, String email) {
    return jdbcTemplate.queryForMap(
        "SELECT id, password, role, status, profile_photo_url FROM "
            + qualifiedUsers
            + " WHERE email = ?",
        email);
  }

  @SuppressWarnings("java:S2077")
  private void insertPasswordResetToken(
      String qualifiedTokens, String email, String token, LocalDateTime expiresAt) {
    jdbcTemplate.update(
        "INSERT INTO " + qualifiedTokens + " (email, token, expires_at) VALUES (?, ?, ?)",
        email,
        token,
        expiresAt);
  }

  @SuppressWarnings("java:S2077")
  private List<Long> findValidPasswordResetTokenIds(
      String qualifiedTokens, String email, String token) {
    return jdbcTemplate.query(
        "SELECT id FROM "
            + qualifiedTokens
            + " WHERE email = ? AND token = ? AND used = FALSE AND expires_at > NOW()",
        (rs, rowNum) -> rs.getLong("id"),
        email,
        token);
  }

  @SuppressWarnings("java:S2077")
  private String selectTenantUserPassword(String qualifiedUsers, String email) {
    return jdbcTemplate.queryForObject(
        "SELECT password FROM " + qualifiedUsers + " WHERE email = ?", String.class, email);
  }

  @SuppressWarnings("java:S2077")
  private void updateTenantUserPassword(
      String qualifiedUsers, String hashedPassword, String email) {
    jdbcTemplate.update(
        SQL_UPDATE + qualifiedUsers + " SET password = ? WHERE email = ?", hashedPassword, email);
  }

  @SuppressWarnings("java:S2077")
  private void markPasswordResetTokenUsed(String qualifiedTokens, Long tokenId) {
    jdbcTemplate.update(SQL_UPDATE + qualifiedTokens + " SET used = TRUE WHERE id = ?", tokenId);
  }

  @SuppressWarnings("java:S2077")
  private void updateTenantUserProfilePhoto(String qualifiedUsers, String photoUrl, String email) {
    jdbcTemplate.update(
        SQL_UPDATE + qualifiedUsers + " SET profile_photo_url = ? WHERE email = ?",
        photoUrl,
        email);
  }
}
