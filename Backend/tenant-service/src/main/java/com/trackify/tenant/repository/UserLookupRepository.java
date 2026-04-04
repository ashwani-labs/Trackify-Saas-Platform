package com.trackify.tenant.repository;

import com.trackify.tenant.entity.UserLookup;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLookupRepository extends JpaRepository<UserLookup, Long> {
  Optional<UserLookup> findByEmail(String email);

  Optional<UserLookup> findByEmailAndTenantId(String email, Long tenantId);
}
