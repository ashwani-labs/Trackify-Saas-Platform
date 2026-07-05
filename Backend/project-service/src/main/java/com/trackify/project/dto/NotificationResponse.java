package com.trackify.project.dto;

import com.trackify.project.enums.NotificationReferenceType;
import com.trackify.project.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
  private Long id;
  private NotificationType type;
  private String title;
  private String message;
  private boolean read;
  private NotificationReferenceType referenceType;
  private Long referenceId;
  private Long projectId;
  private String issueKey;
  private LocalDateTime createdAt;
}
