package com.trackify.tenant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "platform_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 64)
  private String action;

  @Column(name = "actor_email", length = 255)
  private String actorEmail;

  @Column(name = "tenant_id")
  private Long tenantId;

  @Column(name = "tenant_name", length = 255)
  private String tenantName;

  @Column(columnDefinition = "TEXT")
  private String details;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    if (createdAt == null) createdAt = LocalDateTime.now();
  }
}
