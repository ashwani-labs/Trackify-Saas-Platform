package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.trackify.project.dto.ProjectRequest;
import com.trackify.project.dto.ProjectResponse;
import com.trackify.project.entity.Project;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
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

    when(projectRepository.save(any(Project.class))).thenReturn(savedProject);

    ProjectResponse response = projectService.createProject(projectRequest, 10L);

    assertNotNull(response);
    assertEquals(1L, response.getId());
    assertEquals("Test Project", response.getName());
    assertEquals(10L, response.getOwnerId());
    verify(projectRepository, times(1)).save(any(Project.class));
  }
}
