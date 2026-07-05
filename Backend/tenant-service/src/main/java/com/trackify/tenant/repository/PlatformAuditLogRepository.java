package com.trackify.tenant.repository;

import com.trackify.tenant.entity.PlatformAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformAuditLogRepository extends JpaRepository<PlatformAuditLog, Long> {
  Page<PlatformAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
