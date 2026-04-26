package com.trackify.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectStatsResponse {
  private long totalProjects;
  private long todoCount;
  private long inProgressCount;
  private long doneCount;
  private long totalIssues;
}
