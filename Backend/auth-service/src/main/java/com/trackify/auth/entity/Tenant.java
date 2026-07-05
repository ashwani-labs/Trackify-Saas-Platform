package com.trackify.auth.entity;

import com.trackify.common.enums.Plan;
import com.trackify.common.enums.TenantStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String domain;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private Plan plan = Plan.FREE;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private TenantStatus status = TenantStatus.ACTIVE;

  @Column(name = "db_name", nullable = false, unique = true)
  private String dbName;

  @Column(name = "db_host")
  @Builder.Default
  private String dbHost = "localhost";

  @Column(name = "db_port")
  @Builder.Default
  private Integer dbPort = 3306;

  @Column(name = "db_username", nullable = false)
  private String dbUsername;

  @Column(name = "db_password", nullable = false)
  private String dbPassword;

  @Column(name = "logo_url")
  private String logoUrl;

  @Column(name = "company_name")
  private String companyName;

  @Column(name = "primary_color")
  @Builder.Default
  private String primaryColor = "#6366f1";

  @Column(name = "brand_theme", nullable = false)
  @Builder.Default
  private String brandTheme = "indigo";

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}
