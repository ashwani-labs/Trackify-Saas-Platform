package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.trackify.project.dto.DashboardResponse;
import com.trackify.project.dto.ProjectStatsResponse;
import com.trackify.project.entity.ActivityEvent;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.ActivityEventType;
import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.enums.SprintStatus;
import com.trackify.project.repository.ActivityEventRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.repository.SprintRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

  @Mock private ProjectService projectService;
  @Mock private ProjectRepository projectRepository;
  @Mock private IssueRepository issueRepository;
  @Mock private ActivityEventRepository activityEventRepository;
  @Mock private SprintRepository sprintRepository;
  @Mock private NotificationService notificationService;

  @InjectMocks private DashboardService dashboardService;

  @Test
  void getDashboard_returnsWidgetDataForMember() {
    ProjectStatsResponse summary =
        ProjectStatsResponse.builder()
            .totalProjects(2)
            .todoCount(3)
            .inProgressCount(1)
            .doneCount(4)
            .totalIssues(8)
            .build();

    Project project = Project.builder().id(10L).name("Alpha").build();
    Issue issue =
        Issue.builder()
            .id(1L)
            .issueKey("ALP-1")
            .title("Fix login")
            .status(IssueStatus.TODO)
            .priority(IssuePriority.HIGH)
            .project(project)
            .updatedAt(LocalDateTime.now())
            .build();

    ActivityEvent activity =
        ActivityEvent.builder()
            .id(99L)
            .projectId(10L)
            .issueId(1L)
            .eventType(ActivityEventType.STATUS_CHANGED)
            .summary("Status changed to TODO")
            .createdAt(LocalDateTime.now())
            .build();

    when(projectRepository.findProjectIdsByUserId(5L)).thenReturn(List.of(10L));
    when(projectService.getProjectStatsForScope(false, List.of(10L))).thenReturn(summary);
    when(notificationService.getUnreadCount(5L)).thenReturn(2L);
    when(issueRepository.countByAssigneeIdAndStatusNot(5L, IssueStatus.DONE)).thenReturn(1L);
    when(sprintRepository.countByStatusAndProjectIds(SprintStatus.ACTIVE, List.of(10L)))
        .thenReturn(1L);
    when(issueRepository.countByPriorityAndProjectIds(IssuePriority.LOW, List.of(10L)))
        .thenReturn(1L);
    when(issueRepository.countByPriorityAndProjectIds(IssuePriority.MEDIUM, List.of(10L)))
        .thenReturn(2L);
    when(issueRepository.countByPriorityAndProjectIds(IssuePriority.HIGH, List.of(10L)))
        .thenReturn(1L);
    when(issueRepository.countByPriorityAndProjectIds(IssuePriority.URGENT, List.of(10L)))
        .thenReturn(0L);
    when(issueRepository.findMyOpenIssues(eq(5L), eq(IssueStatus.DONE), any(Pageable.class)))
        .thenReturn(List.of(issue));
    when(activityEventRepository.findByProjectIdInOrderByCreatedAtDesc(
            eq(List.of(10L)), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(activity)));
    when(projectRepository.findByMemberUserId(eq(5L), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(project)));
    when(projectService.getProjectById(10L, 5L, "USER"))
        .thenReturn(
            com.trackify.project.dto.ProjectResponse.builder().id(10L).name("Alpha").build());

    DashboardResponse response = dashboardService.getDashboard(5L, "USER");

    assertEquals(summary, response.getSummary());
    assertEquals(2L, response.getUnreadNotifications());
    assertEquals(1L, response.getAssignedToMeCount());
    assertEquals(1L, response.getActiveSprintCount());
    assertEquals(4, response.getPriorityBreakdown().size());
    assertEquals(1, response.getMyOpenIssues().size());
    assertEquals("Fix login", response.getMyOpenIssues().get(0).getTitle());
    assertEquals(1, response.getRecentActivity().size());
    assertEquals(1, response.getRecentProjects().size());
  }
}
