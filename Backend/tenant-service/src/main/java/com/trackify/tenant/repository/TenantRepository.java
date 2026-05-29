package com.trackify.tenant.repository;

import com.trackify.common.enums.TenantStatus;
import com.trackify.tenant.entity.Tenant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
  Optional<Tenant> findByDomain(String domain);

  boolean existsByDomain(String domain);

  long countByStatus(TenantStatus status);
}
