package com.trackify.tenant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
    name = "user_lookup",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"email", "tenant_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLookup {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String email;

  @Column(name = "tenant_id", nullable = false)
  private Long tenantId;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
}
