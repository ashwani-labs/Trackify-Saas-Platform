package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.client.NotificationEmailClient;
import com.trackify.project.dto.CommentRequest;
import com.trackify.project.dto.CommentResponse;
import com.trackify.project.dto.IssueAttachmentResponse;
import com.trackify.project.dto.IssueRequest;
import com.trackify.project.dto.IssueResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.IssueAttachment;
import com.trackify.project.entity.IssueComment;
import com.trackify.project.entity.Project;
import com.trackify.project.entity.Sprint;
import com.trackify.project.enums.IssuePriority;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.repository.IssueAttachmentRepository;
import com.trackify.project.repository.IssueCommentRepository;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.repository.SprintRepository;
import com.trackify.project.util.IssueLabelUtil;
import com.trackify.project.util.ProjectKeyUtil;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class IssueService {

  private static final String ISSUE_NOT_FOUND = "Issue not found";

  private final IssueRepository issueRepository;
  private final ProjectRepository projectRepository;
  private final IssueCommentRepository commentRepository;
  private final IssueAttachmentRepository attachmentRepository;
  private final StorageService storageService;
  private final FileUploadValidator fileUploadValidator;
  private final JdbcTemplate jdbcTemplate;
  private final SprintRepository sprintRepository;
  private final NotificationService notificationService;
  private final ActivityService activityService;
  private final NotificationEmailClient notificationEmailClient;

  public IssueService(
      IssueRepository issueRepository,
      ProjectRepository projectRepository,
      IssueCommentRepository commentRepository,
      IssueAttachmentRepository attachmentRepository,
      StorageService storageService,
      DataSource dataSource,
      SprintRepository sprintRepository,
      NotificationService notificationService,
      ActivityService activityService,
      FileUploadValidator fileUploadValidator,
      NotificationEmailClient notificationEmailClient) {
    this.issueRepository = issueRepository;
    this.projectRepository = projectRepository;
    this.commentRepository = commentRepository;
    this.attachmentRepository = attachmentRepository;
    this.storageService = storageService;
    this.fileUploadValidator = fileUploadValidator;
    this.jdbcTemplate = new JdbcTemplate(dataSource);
    this.sprintRepository = sprintRepository;
    this.notificationService = notificationService;
    this.activityService = activityService;
    this.notificationEmailClient = notificationEmailClient;
  }

  @Transactional
  public IssueResponse createIssue(IssueRequest request, Long reporterId) {
    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(() -> AppException.notFound("Project not found"));

    Sprint sprint = null;
    if (request.getSprintId() != null) {
      sprint =
          sprintRepository
              .findById(request.getSprintId())
              .orElseThrow(() -> AppException.notFound("Sprint not found"));
    }

    String issueKey = allocateIssueKey(project);

    Issue issue =
        Issue.builder()
            .issueKey(issueKey)
            .title(request.getTitle())
            .description(request.getDescription())
            .status(request.getStatus() != null ? request.getStatus() : IssueStatus.TODO)
            .priority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM)
            .project(project)
            .sprint(sprint)
            .reporterId(reporterId)
            .assigneeId(request.getAssigneeId())
            .labels(IssueLabelUtil.serialize(request.getLabels()))
            .build();

    issue = issueRepository.save(issue);

    if (request.getAssigneeId() != null) {
      sendAssignmentEmail(request.getAssigneeId(), issue.getTitle());
      notificationService.notifyIssueAssigned(request.getAssigneeId(), issue);
    }

    return mapToResponse(issue);
  }

  public List<IssueResponse> getIssuesByProject(Long projectId) {
    return issueRepository.findAllByProjectId(projectId).stream().map(this::mapToResponse).toList();
  }

  public org.springframework.data.domain.Page<IssueResponse> getIssuesByProject(
      Long projectId, org.springframework.data.domain.Pageable pageable) {
    return issueRepository.findAllByProjectId(projectId, pageable).map(this::mapToResponse);
  }

  public IssueResponse getIssueById(Long id) {
    Issue issue =
        issueRepository.findById(id).orElseThrow(() -> AppException.notFound(ISSUE_NOT_FOUND));
    return mapToResponse(issue);
  }

  public IssueResponse getIssueByKey(String issueKey) {
    Issue issue =
        issueRepository
            .findByIssueKey(issueKey)
            .orElseThrow(() -> AppException.notFound(ISSUE_NOT_FOUND));
    return mapToResponse(issue);
  }

  @Transactional
  public IssueResponse updateIssue(Long id, IssueRequest request, Long actorUserId) {
    Issue issue =
        issueRepository.findById(id).orElseThrow(() -> AppException.notFound(ISSUE_NOT_FOUND));

    Long previousAssignee = issue.getAssigneeId();
    IssueStatus previousStatus = issue.getStatus();
    Long projectId = issue.getProject().getId();

    issue.setTitle(request.getTitle());
    issue.setDescription(request.getDescription());
    if (request.getStatus() != null) issue.setStatus(request.getStatus());
    if (request.getPriority() != null) issue.setPriority(request.getPriority());
    issue.setAssigneeId(request.getAssigneeId());
    if (request.getLabels() != null) {
      issue.setLabels(IssueLabelUtil.serialize(request.getLabels()));
    }

    if (request.getSprintId() != null) {
      Sprint sprint =
          sprintRepository
              .findById(request.getSprintId())
              .orElseThrow(() -> AppException.notFound("Sprint not found"));
      issue.setSprint(sprint);
    } else {
      issue.setSprint(null);
    }

    issue = issueRepository.save(issue);

    if (request.getStatus() != null && !Objects.equals(request.getStatus(), previousStatus)) {
      String fromStatus = previousStatus != null ? previousStatus.name() : "UNSET";
      String toStatus = issue.getStatus().name();
      activityService.recordStatusChanged(
          projectId, issue.getId(), actorUserId, fromStatus, toStatus);
      notificationService.notifyIssueStatusChanged(issue, actorUserId, fromStatus, toStatus);
    }

    Long newAssignee = request.getAssigneeId();
    if (!Objects.equals(newAssignee, previousAssignee)) {
      activityService.recordAssigneeChanged(
          projectId, issue.getId(), actorUserId, previousAssignee, newAssignee);
      if (newAssignee != null) {
        sendAssignmentEmail(newAssignee, issue.getTitle());
        notificationService.notifyIssueAssigned(newAssignee, issue);
      }
    }

    return mapToResponse(issue);
  }

  @Transactional
  public void deleteIssue(Long id) {
    if (!issueRepository.existsById(id)) {
      throw AppException.notFound(ISSUE_NOT_FOUND);
    }
    issueRepository.deleteById(id);
  }

  @Transactional
  public CommentResponse addComment(Long issueId, CommentRequest request, Long userId) {
    Issue issue =
        issueRepository.findById(issueId).orElseThrow(() -> AppException.notFound(ISSUE_NOT_FOUND));

    IssueComment comment =
        IssueComment.builder().issue(issue).userId(userId).content(request.getContent()).build();

    comment = commentRepository.save(comment);
    activityService.recordCommentAdded(issue.getProject().getId(), issue.getId(), userId);
    notificationService.notifyIssueComment(issue, userId);
    return mapToCommentResponse(comment);
  }

  public List<CommentResponse> getIssueComments(Long issueId) {
    return commentRepository.findAllByIssueIdOrderByCreatedAtDesc(issueId).stream()
        .map(this::mapToCommentResponse)
        .toList();
  }

  // --- Attachments ---

  @Transactional
  public IssueAttachmentResponse addAttachment(Long issueId, MultipartFile file, Long uploaderId) {
    Issue issue =
        issueRepository.findById(issueId).orElseThrow(() -> AppException.notFound(ISSUE_NOT_FOUND));

    fileUploadValidator.validate(file);
    String fileKey = storageService.store(file);

    IssueAttachment attachment =
        IssueAttachment.builder()
            .issue(issue)
            .fileName(file.getOriginalFilename())
            .fileKey(fileKey)
            .contentType(file.getContentType())
            .fileSize(file.getSize())
            .uploaderId(uploaderId)
            .build();

    attachment = attachmentRepository.save(attachment);
    return mapToAttachmentResponse(attachment);
  }

  public List<IssueAttachmentResponse> getIssueAttachments(Long issueId) {
    return attachmentRepository.findAllByIssueId(issueId).stream()
        .map(this::mapToAttachmentResponse)
        .toList();
  }

  public Resource downloadAttachment(Long attachmentId) {
    IssueAttachment attachment =
        attachmentRepository
            .findById(attachmentId)
            .orElseThrow(() -> AppException.notFound("Attachment not found"));
    return storageService.loadAsResource(attachment.getFileKey());
  }

  @Transactional
  public void deleteAttachment(Long attachmentId) {
    IssueAttachment attachment =
        attachmentRepository
            .findById(attachmentId)
            .orElseThrow(() -> AppException.notFound("Attachment not found"));

    storageService.delete(attachment.getFileKey());
    attachmentRepository.delete(attachment);
  }

  private void sendAssignmentEmail(Long assigneeId, String issueTitle) {
    try {
      String email =
          jdbcTemplate.queryForObject(
              "SELECT email FROM users WHERE id = ?", String.class, assigneeId);
      notificationEmailClient.sendAssignmentEmailAsync(email, issueTitle);
    } catch (Exception e) {
      log.error("Failed to queue assignment email: {}", e.getMessage());
    }
  }

  private String allocateIssueKey(Project project) {
    ensureProjectKey(project);
    long next = (project.getIssueCounter() == null ? 0L : project.getIssueCounter()) + 1;
    project.setIssueCounter(next);
    projectRepository.save(project);
    return project.getProjectKey() + "-" + next;
  }

  private void ensureProjectKey(Project project) {
    if (project.getProjectKey() != null && !project.getProjectKey().isBlank()) {
      if (project.getIssueCounter() == null) {
        project.setIssueCounter(0L);
        projectRepository.save(project);
      }
      return;
    }
    String base = ProjectKeyUtil.deriveBaseKey(project.getName());
    String candidate = base;
    int suffix = 1;
    while (projectRepository.existsByProjectKey(candidate)) {
      candidate = base + suffix++;
    }
    project.setProjectKey(candidate);
    if (project.getIssueCounter() == null) {
      project.setIssueCounter(0L);
    }
    projectRepository.save(project);
  }

  public List<String> getProjectLabels(Long projectId) {
    return IssueLabelUtil.distinctProjectLabels(
        issueRepository.findDistinctLabelValuesByProjectId(projectId));
  }

  private IssueResponse mapToResponse(Issue issue) {
    return IssueResponse.builder()
        .id(issue.getId())
        .issueKey(issue.getIssueKey())
        .title(issue.getTitle())
        .description(issue.getDescription())
        .status(issue.getStatus())
        .priority(issue.getPriority())
        .projectId(issue.getProject().getId())
        .projectHeaderName(issue.getProject().getName())
        .sprintId(issue.getSprint() != null ? issue.getSprint().getId() : null)
        .reporterId(issue.getReporterId())
        .assigneeId(issue.getAssigneeId())
        .labels(IssueLabelUtil.deserialize(issue.getLabels()))
        .createdAt(issue.getCreatedAt())
        .updatedAt(issue.getUpdatedAt())
        .attachments(
            issue.getAttachments() != null
                ? issue.getAttachments().stream().map(this::mapToAttachmentResponse).toList()
                : Collections.emptyList())
        .build();
  }

  private IssueAttachmentResponse mapToAttachmentResponse(IssueAttachment attachment) {
    return IssueAttachmentResponse.builder()
        .id(attachment.getId())
        .fileName(attachment.getFileName())
        .contentType(attachment.getContentType())
        .fileSize(attachment.getFileSize())
        .uploaderId(attachment.getUploaderId())
        .createdAt(attachment.getCreatedAt())
        .build();
  }

  private CommentResponse mapToCommentResponse(IssueComment comment) {
    return CommentResponse.builder()
        .id(comment.getId())
        .issueId(comment.getIssue().getId())
        .userId(comment.getUserId())
        .content(comment.getContent())
        .createdAt(comment.getCreatedAt())
        .build();
  }
}
