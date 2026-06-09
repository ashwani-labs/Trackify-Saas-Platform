package com.trackify.project.dto;

import com.trackify.project.enums.ActivityEventType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityEventResponse {
  private Long id;
  private Long projectId;
  private Long issueId;
  private String issueKey;
  private Long actorUserId;
  private ActivityEventType eventType;
  private String summary;
  private LocalDateTime createdAt;
}
