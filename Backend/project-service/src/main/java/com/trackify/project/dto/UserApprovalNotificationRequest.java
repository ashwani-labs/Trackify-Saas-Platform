package com.trackify.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserApprovalNotificationRequest {
  private Long pendingUserId;
  private String email;
  private String fullName;
}
