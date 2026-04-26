package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssueResponse {
  private Long id;
  private String title;
  private String description;
  private IssueStatus status;
  private IssuePriority priority;
  private Long projectId;
  private String projectHeaderName;
  private Long reporterId;
  private Long assigneeId;
  private Long sprintId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<IssueAttachmentResponse> attachments;
}
