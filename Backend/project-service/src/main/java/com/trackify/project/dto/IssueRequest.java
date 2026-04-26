package com.trackify.project.dto;

import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssueRequest {
  @NotBlank(message = "Issue title is required")
  private String title;

  private String description;

  private IssueStatus status;
  private IssuePriority priority;

  @NotNull(message = "Project ID is required")
  private Long projectId;

  private Long assigneeId;

  private Long sprintId;
}
