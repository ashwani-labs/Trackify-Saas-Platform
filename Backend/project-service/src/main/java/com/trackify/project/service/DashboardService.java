package com.trackify.project.service;

import com.trackify.project.dto.DashboardActivityItem;
import com.trackify.project.dto.DashboardIssueItem;
import com.trackify.project.dto.DashboardResponse;
import com.trackify.project.dto.PriorityCountItem;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.dto.ProjectStatsResponse;
import com.trackify.project.entity.ActivityEvent;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.enums.SprintStatus;
import com.trackify.project.repository.ActivityEventRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.repository.SprintRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private static final int RECENT_ACTIVITY_LIMIT = 8;
  private static final int MY_ISSUES_LIMIT = 5;
  private static final int RECENT_PROJECTS_LIMIT = 5;

  private final ProjectService projectService;
  private final ProjectRepository projectRepository;
  private final IssueRepository issueRepository;
  private final ActivityEventRepository activityEventRepository;
  private final SprintRepository sprintRepository;
  private final NotificationService notificationService;

  public DashboardResponse getDashboard(Long userId, String role) {
    boolean isAdmin = isAdminRole(role);
    List<Long> projectIds =
        isAdmin ? Collections.emptyList() : projectRepository.findProjectIdsByUserId(userId);

    ProjectStatsResponse summary = projectService.getProjectStats(userId, role);
    long unreadNotifications = notificationService.getUnreadCount(userId);
    long assignedToMeCount =
        issueRepository.countByAssigneeIdAndStatusNot(userId, IssueStatus.DONE);
    long activeSprintCount = countActiveSprints(isAdmin, projectIds);

    return DashboardResponse.builder()
        .summary(summary)
        .unreadNotifications(unreadNotifications)
        .assignedToMeCount(assignedToMeCount)
        .activeSprintCount(activeSprintCount)
        .priorityBreakdown(buildPriorityBreakdown(isAdmin, projectIds))
        .myOpenIssues(loadMyOpenIssues(userId))
        .recentActivity(loadRecentActivity(isAdmin, projectIds))
        .recentProjects(loadRecentProjects(isAdmin, projectIds, userId, role))
        .build();
  }

  private long countActiveSprints(boolean isAdmin, List<Long> projectIds) {
    if (isAdmin) {
      return sprintRepository.countByStatus(SprintStatus.ACTIVE);
    }
    if (projectIds.isEmpty()) {
      return 0;
    }
    return sprintRepository.countByStatusAndProjectIds(SprintStatus.ACTIVE, projectIds);
  }

  private List<PriorityCountItem> buildPriorityBreakdown(boolean isAdmin, List<Long> projectIds) {
    return Arrays.stream(IssuePriority.values())
        .map(
            priority ->
                PriorityCountItem.builder()
                    .priority(priority)
                    .count(countByPriority(isAdmin, projectIds, priority))
                    .build())
        .collect(Collectors.toList());
  }

  private long countByPriority(boolean isAdmin, List<Long> projectIds, IssuePriority priority) {
    if (isAdmin) {
      return issueRepository.countByPriority(priority);
    }
    if (projectIds.isEmpty()) {
      return 0;
    }
    return issueRepository.countByPriorityAndProjectIds(priority, projectIds);
  }

  private List<DashboardIssueItem> loadMyOpenIssues(Long userId) {
    Pageable pageable = PageRequest.of(0, MY_ISSUES_LIMIT);
    return issueRepository.findMyOpenIssues(userId, IssueStatus.DONE, pageable).stream()
        .map(this::mapIssueItem)
        .collect(Collectors.toList());
  }

  private List<DashboardActivityItem> loadRecentActivity(boolean isAdmin, List<Long> projectIds) {
    Pageable pageable =
        PageRequest.of(0, RECENT_ACTIVITY_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<ActivityEvent> page;
    if (isAdmin) {
      page = activityEventRepository.findAllByOrderByCreatedAtDesc(pageable);
    } else if (projectIds.isEmpty()) {
      return Collections.emptyList();
    } else {
      page = activityEventRepository.findByProjectIdInOrderByCreatedAtDesc(projectIds, pageable);
    }
    return page.getContent().stream().map(this::mapActivityItem).collect(Collectors.toList());
  }

  private List<ProjectResponse> loadRecentProjects(
      boolean isAdmin, List<Long> projectIds, Long userId, String role) {
    Pageable pageable =
        PageRequest.of(0, RECENT_PROJECTS_LIMIT, Sort.by(Sort.Direction.DESC, "updatedAt"));
    Page<Project> page;
    if (isAdmin) {
      page = projectRepository.findAll(pageable);
    } else if (projectIds.isEmpty()) {
      return Collections.emptyList();
    } else {
      page = projectRepository.findByMemberUserId(userId, pageable);
    }
    return page.getContent().stream()
        .map(project -> projectService.getProjectById(project.getId(), userId, role))
        .collect(Collectors.toList());
  }

  private DashboardIssueItem mapIssueItem(Issue issue) {
    return DashboardIssueItem.builder()
        .id(issue.getId())
        .issueKey(issue.getIssueKey())
        .title(issue.getTitle())
        .status(issue.getStatus())
        .priority(issue.getPriority())
        .projectId(issue.getProject().getId())
        .projectName(issue.getProject().getName())
        .updatedAt(issue.getUpdatedAt())
        .build();
  }

  private DashboardActivityItem mapActivityItem(ActivityEvent event) {
    return DashboardActivityItem.builder()
        .id(event.getId())
        .eventType(event.getEventType())
        .summary(event.getSummary())
        .projectId(event.getProjectId())
        .issueId(event.getIssueId())
        .createdAt(event.getCreatedAt())
        .build();
  }

  private boolean isAdminRole(String role) {
    return "ADMIN".equalsIgnoreCase(role) || "MASTER".equalsIgnoreCase(role);
  }
}
