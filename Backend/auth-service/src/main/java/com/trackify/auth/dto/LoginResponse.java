package com.trackify.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

  private String token;
  private String role;

  @JsonProperty("tenant_id")
  private Long tenantId;

  private String domain;

  @JsonProperty("profile_photo_url")
  private String profilePhotoUrl;

  @JsonProperty("company_name")
  private String companyName;

  @JsonProperty("logo_url")
  private String logoUrl;

  @JsonProperty("primary_color")
  private String primaryColor;

  private String plan;
}
