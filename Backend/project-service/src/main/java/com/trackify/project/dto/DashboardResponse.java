package com.trackify.project.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
  private ProjectStatsResponse summary;
  private long unreadNotifications;
  private long assignedToMeCount;
  private long activeSprintCount;
  private List<PriorityCountItem> priorityBreakdown;
  private List<DashboardIssueItem> myOpenIssues;
  private List<DashboardActivityItem> recentActivity;
  private List<ProjectResponse> recentProjects;
}
