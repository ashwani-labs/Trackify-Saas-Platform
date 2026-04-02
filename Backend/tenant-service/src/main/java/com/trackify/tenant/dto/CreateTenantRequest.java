package com.trackify.tenant.dto;

import com.trackify.common.enums.Plan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTenantRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotNull(message = "Plan is required")
    private Plan plan;
}
