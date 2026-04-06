package com.trackify.tenant.dto;

import com.trackify.common.enums.Role;
import com.trackify.common.enums.UserStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
  private Long id;
  private String email;
  private String fullName;
  private Role role;
  private UserStatus status;
  private LocalDateTime createdAt;
  private Long tenantId;
}
