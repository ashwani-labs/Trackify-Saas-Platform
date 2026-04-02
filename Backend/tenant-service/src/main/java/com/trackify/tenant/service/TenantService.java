package com.trackify.tenant.service;

import com.trackify.common.enums.TenantStatus;
import com.trackify.common.exception.AppException;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.dto.UpdateTenantStatusRequest;
import com.trackify.tenant.entity.Tenant;
import com.trackify.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public TenantResponse createTenant(CreateTenantRequest request) {
        if (tenantRepository.existsByDomain(request.getDomain())) {
            throw AppException.conflict("Domain already exists");
        }

        String dbName = "trackify_tenant_" + request.getDomain();
        String dbUsername = request.getDomain() + "_admin";
        
        // In reality, password should be generated securely.
        String dbPassword = "pw_" + System.currentTimeMillis(); 

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .domain(request.getDomain())
                .plan(request.getPlan())
                .status(TenantStatus.ACTIVE)
                .dbName(dbName)
                .dbHost("localhost")
                .dbPort(3306)
                .dbUsername(dbUsername)
                .dbPassword(dbPassword)
                .build();

        tenant = tenantRepository.save(tenant);
        
        provisionTenantDatabase(dbName, dbUsername, dbPassword);
        
        return mapToResponse(tenant);
    }

    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Tenant not found"));
        return mapToResponse(tenant);
    }
    
    @Transactional
    public TenantResponse updateTenantStatus(Long id, UpdateTenantStatusRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Tenant not found"));
                
        tenant.setStatus(request.getStatus());
        tenant = tenantRepository.save(tenant);
        return mapToResponse(tenant);
    }

    private void provisionTenantDatabase(String dbName, String dbUsername, String dbPassword) {
        try {
            log.info("Provisioning database: {}", dbName);
            jdbcTemplate.execute("CREATE DATABASE IF NOT EXISTS " + dbName);
            jdbcTemplate.execute("CREATE USER IF NOT EXISTS '" + dbUsername + "'@'localhost' IDENTIFIED BY '" + dbPassword + "'");
            jdbcTemplate.execute("GRANT ALL PRIVILEGES ON " + dbName + ".* TO '" + dbUsername + "'@'localhost'");
            jdbcTemplate.execute("FLUSH PRIVILEGES");
            
            // Create user table for tenant
            jdbcTemplate.execute("USE " + dbName);
            String createUserTable = """
                CREATE TABLE IF NOT EXISTS users (
                  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                  email        VARCHAR(255) NOT NULL UNIQUE,
                  password     VARCHAR(255) NOT NULL,
                  full_name    VARCHAR(255),
                  role         ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
                  status       ENUM('PENDING','ACTIVE','INACTIVE') DEFAULT 'PENDING',
                  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """;
            jdbcTemplate.execute(createUserTable);
            
            log.info("Provisioned database successfully: {}", dbName);
        } catch (Exception e) {
            log.error("Failed to provision database {}: {}", dbName, e.getMessage());
            throw AppException.internalError("Failed to provision tenant database");
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
