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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MasterUserRepository masterUserRepository;
    private final UserLookupRepository userLookupRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        // 1. Try Platform Master User
        Optional<MasterUser> masterUserOpt = masterUserRepository.findByEmail(request.getEmail());
        if (masterUserOpt.isPresent()) {
            MasterUser user = masterUserOpt.get();
            if (!user.isActive()) throw AppException.forbidden("Your account has been deactivated");
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw AppException.unauthorized("Invalid email or password");
            }
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return LoginResponse.builder().token(token).role(user.getRole().name()).build();
        }

        // 2. Try Tenant User (via lookup)
        UserLookup lookup = userLookupRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> AppException.unauthorized("Invalid email or password"));

        Tenant tenant = tenantRepository.findById(lookup.getTenantId())
                .orElseThrow(() -> AppException.internalError("Tenant mapping corrupted"));

        // Connect to tenant DB to verify password
        Map<String, Object> userData = checkTenantUserCredentials(tenant, request.getEmail(), request.getPassword());
        
        String role = (String) userData.get("role");
        String token = jwtUtil.generateToken(request.getEmail(), role, tenant.getId());

        return LoginResponse.builder()
                .token(token)
                .role(role)
                .tenantId(tenant.getId())
                .build();
    }

    private Map<String, Object> checkTenantUserCredentials(Tenant tenant, String email, String password) {
        String dbUrl = String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
                tenant.getDbHost(), tenant.getDbPort(), tenant.getDbName());

        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl(dbUrl);
        dataSource.setUsername(tenant.getDbUsername());
        dataSource.setPassword(tenant.getDbPassword());

        JdbcTemplate tenantJdbc = new JdbcTemplate(dataSource);

        try {
            Map<String, Object> user = tenantJdbc.queryForMap(
                "SELECT password, role, status FROM users WHERE email = ?", email);

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
            log.error("Error authenticating against tenant DB {}: {}", tenant.getDbName(), e.getMessage());
            throw AppException.unauthorized("Invalid email or password");
        }
    }
}
