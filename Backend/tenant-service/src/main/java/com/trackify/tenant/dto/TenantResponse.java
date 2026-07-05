package com.trackify.tenant.dto;

import com.trackify.common.enums.Plan;
import com.trackify.common.enums.TenantStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
  private Long id;
  private String name;
  private String domain;
  private Plan plan;
  private TenantStatus status;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private String companyName;
  private String logoUrl;
  private String primaryColor;
  private String brandTheme;
}
