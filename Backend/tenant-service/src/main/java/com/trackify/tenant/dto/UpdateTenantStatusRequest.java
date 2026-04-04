package com.trackify.tenant.dto;

import com.trackify.common.enums.TenantStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTenantStatusRequest {
  @NotNull(message = "Status is required")
  private TenantStatus status;
}
