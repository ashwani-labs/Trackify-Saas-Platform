package com.trackify.tenant.dto;

import lombok.Data;

@Data
public class UpdateTenantBrandingRequest {
  private String companyName;
  private String logoUrl;
  private String primaryColor;
}
