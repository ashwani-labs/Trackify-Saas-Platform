package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.trackify.common.enums.Plan;
import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.ActivityEventRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectMemberRepository;
import com.trackify.project.repository.ProjectRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

  @Mock private ProjectRepository projectRepository;
  @Mock private IssueRepository issueRepository;
  @Mock private ActivityEventRepository activityEventRepository;
  @Mock private ProjectMemberRepository projectMemberRepository;
  @Mock private TenantPlanService tenantPlanService;

  @InjectMocks private ProjectService projectService;

  private ProjectRequest projectRequest;

  @BeforeEach
  void setUp() {
    projectRequest = new ProjectRequest();
    projectRequest.setName("Test Project");
    projectRequest.setDescription("Description");
  }

  @Test
  void testCreateProject_Success() {
    Project savedProject =
        Project.builder()
            .id(1L)
            .name("Test Project")
            .description("Description")
            .ownerId(10L)
            .build();

    when(projectRepository.count()).thenReturn(0L);
    when(tenantPlanService.getCurrentTenantPlan()).thenReturn(Plan.PRO);
    when(projectRepository.save(any(Project.class))).thenReturn(savedProject);
    when(issueRepository.countByProjectIdAndStatus(1L, IssueStatus.TODO)).thenReturn(0L);
    when(issueRepository.countByProjectIdAndStatus(1L, IssueStatus.IN_PROGRESS)).thenReturn(0L);
    when(issueRepository.countByProjectIdAndStatus(1L, IssueStatus.DONE)).thenReturn(0L);
    when(projectMemberRepository.countByProjectId(1L)).thenReturn(0L);
    when(activityEventRepository.findFirstByProjectIdOrderByCreatedAtDesc(1L))
        .thenReturn(Optional.empty());

    ProjectResponse response = projectService.createProject(projectRequest, 10L);

    assertNotNull(response);
    assertEquals(1L, response.getId());
    assertEquals("Test Project", response.getName());
    assertEquals(10L, response.getOwnerId());
    verify(projectRepository, times(1)).save(any(Project.class));
  }
}
