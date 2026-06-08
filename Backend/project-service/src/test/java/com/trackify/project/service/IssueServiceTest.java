package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.IssueRequest;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Project;
import com.trackify.project.entity.Sprint;
import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.IssueAttachmentRepository;
import com.trackify.project.repository.IssueCommentRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.repository.SprintRepository;
import java.util.Optional;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

  @Mock private IssueRepository issueRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private IssueCommentRepository commentRepository;
  @Mock private IssueAttachmentRepository attachmentRepository;
  @Mock private StorageService storageService;
  @Mock private DataSource dataSource;
  @Mock private SprintRepository sprintRepository;
  @Mock private NotificationService notificationService;
  @Mock private ActivityService activityService;
  @Mock private FileUploadValidator fileUploadValidator;

  @InjectMocks private IssueService issueService;

  private Project project;
  private IssueRequest baseRequest;

  @BeforeEach
  void setUp() {
    project =
        Project.builder().id(10L).name("Platform").projectKey("PLATFORM").issueCounter(0L).build();
    baseRequest = IssueRequest.builder().title("Bug: login fails").projectId(10L).build();
  }

  @Test
  void createIssue_setsDefaultStatusAndPriority_whenNotProvided() {
    when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
    when(projectRepository.save(any(Project.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(issueRepository.save(any(Issue.class)))
        .thenAnswer(
            invocation -> {
              Issue i = invocation.getArgument(0);
              i.setId(100L);
              return i;
            });

    IssueResponse response = issueService.createIssue(baseRequest, 22L);

    assertNotNull(response);
    assertEquals(100L, response.getId());
    assertEquals(IssueStatus.TODO, response.getStatus());
    assertEquals(IssuePriority.MEDIUM, response.getPriority());
    assertEquals(22L, response.getReporterId());
    verify(projectRepository).findById(10L);
    verify(issueRepository).save(any(Issue.class));
  }

  @Test
  void createIssue_throwsNotFound_whenProjectMissing() {
    when(projectRepository.findById(10L)).thenReturn(Optional.empty());

    assertThrows(AppException.class, () -> issueService.createIssue(baseRequest, 22L));

    verify(issueRepository, never()).save(any(Issue.class));
  }

  @Test
  void updateIssue_throwsNotFound_whenSprintIdProvidedButSprintMissing() {
    Issue existing = Issue.builder().id(200L).title("Old title").project(project).build();
    IssueRequest updateRequest =
        IssueRequest.builder().title("New title").projectId(10L).sprintId(999L).build();

    when(issueRepository.findById(200L)).thenReturn(Optional.of(existing));
    when(sprintRepository.findById(999L)).thenReturn(Optional.empty());

    assertThrows(AppException.class, () -> issueService.updateIssue(200L, updateRequest, 1L));

    verify(issueRepository, never()).save(any(Issue.class));
  }

  @Test
  void updateIssue_appliesSprintAndStatus_whenValidDataProvided() {
    Issue existing = Issue.builder().id(201L).title("Old title").project(project).build();
    Sprint sprint = Sprint.builder().id(300L).name("Sprint 1").project(project).build();
    IssueRequest updateRequest =
        IssueRequest.builder()
            .title("Updated title")
            .description("Updated description")
            .projectId(10L)
            .status(IssueStatus.IN_PROGRESS)
            .priority(IssuePriority.HIGH)
            .sprintId(300L)
            .build();

    when(issueRepository.findById(201L)).thenReturn(Optional.of(existing));
    when(sprintRepository.findById(300L)).thenReturn(Optional.of(sprint));
    when(issueRepository.save(any(Issue.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    IssueResponse response = issueService.updateIssue(201L, updateRequest, 1L);

    assertEquals(IssueStatus.IN_PROGRESS, response.getStatus());
    assertEquals(IssuePriority.HIGH, response.getPriority());
    assertEquals(300L, response.getSprintId());
    verify(issueRepository).save(existing);
  }

  @Test
  void deleteIssue_throwsNotFound_whenIssueDoesNotExist() {
    when(issueRepository.existsById(404L)).thenReturn(false);

    assertThrows(AppException.class, () -> issueService.deleteIssue(404L));

    verify(issueRepository, never()).deleteById(any(Long.class));
  }

  @Test
  void updateIssue_changesStatusTransition_whenProvided() {
    Issue existing =
        Issue.builder()
            .id(301L)
            .title("Transition issue")
            .status(IssueStatus.TODO)
            .project(project)
            .build();
    IssueRequest updateRequest =
        IssueRequest.builder()
            .title("Transition issue")
            .projectId(10L)
            .status(IssueStatus.DONE)
            .build();

    when(issueRepository.findById(301L)).thenReturn(Optional.of(existing));
    when(issueRepository.save(any(Issue.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    IssueResponse response = issueService.updateIssue(301L, updateRequest, 1L);

    assertEquals(IssueStatus.DONE, response.getStatus());
    verify(issueRepository).save(existing);
  }

  @Test
  void updateIssue_updatesAssignee_whenProvided() {
    Issue existing = Issue.builder().id(302L).title("Assignee issue").project(project).build();
    IssueRequest updateRequest =
        IssueRequest.builder().title("Assignee issue").projectId(10L).assigneeId(77L).build();

    when(issueRepository.findById(302L)).thenReturn(Optional.of(existing));
    when(issueRepository.save(any(Issue.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    IssueResponse response = issueService.updateIssue(302L, updateRequest, 1L);

    assertEquals(77L, response.getAssigneeId());
    verify(issueRepository).save(existing);
  }
}
