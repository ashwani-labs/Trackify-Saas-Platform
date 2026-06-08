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
public class DashboardActivityItem {
  private Long id;
  private ActivityEventType eventType;
  private String summary;
  private Long projectId;
  private Long issueId;
  private LocalDateTime createdAt;
}
