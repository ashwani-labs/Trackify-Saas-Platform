package com.trackify.tenant.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAuditLogResponse {
  private Long id;
  private String action;
  private String actorEmail;
  private Long tenantId;
  private String tenantName;
  private String details;
  private LocalDateTime createdAt;
}
