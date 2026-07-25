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
import java.util.Map;
import java.util.Optional;
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
        throw AppException.unauthorized("Invalid email or password");
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

    return LoginResponse.builder()
        .token(token)
        .role(role)
        .tenantId(tenant.getId())
        .domain(tenant.getDomain())
        .profilePhotoUrl((String) userData.get("profile_photo_url"))
        .companyName(tenant.getCompanyName())
        .logoUrl(tenant.getLogoUrl())
        .primaryColor(tenant.getPrimaryColor())
        .brandTheme(
            tenant.getBrandTheme() != null
                ? tenant.getBrandTheme()
                : com.trackify.common.theme.TenantThemes.DEFAULT)
        .plan(tenant.getPlan() != null ? tenant.getPlan().name() : null)
        .build();
  }

  private Map<String, Object> checkTenantUserCredentials(
      Tenant tenant, String email, String password) {

    log.info(
        "Authenticating user {} for tenant {} using master connection", email, tenant.getDbName());

    try {
      String sql =
          String.format(
              "SELECT id, password, role, status, profile_photo_url FROM %s.users WHERE email = ?",
              tenant.getDbName());

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
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error(
          "Error authenticating against tenant DB {}: {}. Root cause: {}",
          tenant.getDbName(),
          e.getMessage(),
          e.getCause() != null ? e.getCause().getMessage() : "N/A");
      throw AppException.unauthorized("Invalid email or password");
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
            .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

    String token = java.util.UUID.randomUUID().toString();
    java.time.LocalDateTime expiresAt = java.time.LocalDateTime.now().plusHours(1);

    try {
      String sql =
          String.format(
              "INSERT INTO %s.password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
              tenant.getDbName());
      jdbcTemplate.update(sql, email, token, expiresAt);
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
            .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

    try {
      // Find token
      String sqlFind =
          String.format(
              "SELECT id FROM %s.password_reset_tokens WHERE email = ? AND token = ? AND used = FALSE AND expires_at > NOW()",
              tenant.getDbName());
      java.util.List<Long> tokens =
          jdbcTemplate.query(
              sqlFind, (rs, rowNum) -> rs.getLong("id"), request.getEmail(), request.getToken());

      if (tokens.isEmpty()) {
        throw AppException.badRequest("Invalid or expired password reset token");
      }

      // Update password in users table
      String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
      String sqlUpdatePass =
          String.format("UPDATE %s.users SET password = ? WHERE email = ?", tenant.getDbName());
      jdbcTemplate.update(sqlUpdatePass, newHashedPassword, request.getEmail());

      // Mark token as used
      String sqlUpdateToken =
          String.format(
              "UPDATE %s.password_reset_tokens SET used = TRUE WHERE id = ?", tenant.getDbName());
      jdbcTemplate.update(sqlUpdateToken, tokens.get(0));

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
            .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

    try {
      // 1. Get current password from tenant DB
      String sqlSelect =
          String.format("SELECT password FROM %s.users WHERE email = ?", tenant.getDbName());
      String currentHashedPassword =
          jdbcTemplate.queryForObject(sqlSelect, String.class, request.getEmail());

      // 2. Verify current password
      if (currentHashedPassword == null
          || !passwordEncoder.matches(request.getCurrentPassword(), currentHashedPassword)) {
        throw AppException.unauthorized("Incorrect current password");
      }

      // 3. Update to new password
      String newHashedPassword = passwordEncoder.encode(request.getNewPassword());
      String sqlUpdate =
          String.format("UPDATE %s.users SET password = ? WHERE email = ?", tenant.getDbName());
      jdbcTemplate.update(sqlUpdate, newHashedPassword, request.getEmail());

      log.info("Password successfully changed for {}", request.getEmail());
    } catch (AppException e) {
      throw e;
    } catch (Exception e) {
      log.error("Failed to change password: {}", e.getMessage());
      throw AppException.internalError("Could not update password. Please try again.");
    }
  }

  public void updateProfilePhoto(String email, String photoUrl) {
    // 1. Try Platform Master User
    Optional<MasterUser> masterUserOpt = masterUserRepository.findByEmail(email);
    if (masterUserOpt.isPresent()) {
      MasterUser user = masterUserOpt.get();
      user.setProfilePhotoUrl(photoUrl);
      masterUserRepository.save(user);
      return;
    }

    // 2. Try Tenant User
    UserLookup lookup =
        userLookupRepository
            .findByEmail(email)
            .orElseThrow(() -> AppException.notFound("User not found"));

    Tenant tenant =
        tenantRepository
            .findById(lookup.getTenantId())
            .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

    try {
      String sql =
          String.format(
              "UPDATE %s.users SET profile_photo_url = ? WHERE email = ?", tenant.getDbName());
      jdbcTemplate.update(sql, photoUrl, email);
    } catch (Exception e) {
      log.error("Failed to update profile photo: {}", e.getMessage());
      throw AppException.internalError("Could not update profile photo");
    }
  }
}
