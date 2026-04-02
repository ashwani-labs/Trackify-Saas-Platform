package com.trackify.tenant.dto;

import com.trackify.common.enums.Plan;
import com.trackify.common.enums.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
}
