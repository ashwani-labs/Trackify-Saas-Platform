package com.trackify.tenant.repository;

import com.trackify.tenant.entity.UserLookup;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface UserLookupRepository extends JpaRepository<UserLookup, Long> {
  Optional<UserLookup> findByEmail(String email);

  Optional<UserLookup> findByEmailAndTenantId(String email, Long tenantId);

  @Modifying
  @Transactional
  @Query("DELETE FROM UserLookup u WHERE u.tenantId = ?1")
  void deleteByTenantId(Long tenantId);
}
