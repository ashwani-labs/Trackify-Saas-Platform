package com.trackify.auth.repository;

import com.trackify.auth.entity.Tenant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
  Optional<Tenant> findByDomain(String domain);
}
