package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardIssueItem {
  private Long id;
  private String issueKey;
  private String title;
  private IssueStatus status;
  private IssuePriority priority;
  private Long projectId;
  private String projectName;
  private LocalDateTime updatedAt;
}
