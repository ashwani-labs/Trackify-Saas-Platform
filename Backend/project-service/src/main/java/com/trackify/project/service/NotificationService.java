package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.NotificationResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Notification;
import com.trackify.project.enums.NotificationReferenceType;
import com.trackify.project.enums.NotificationType;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final IssueRepository issueRepository;
  private final NotificationStreamService notificationStreamService;
  private final JdbcTemplate jdbcTemplate;

  @Transactional
  public void notifyUserApprovalPending(Long pendingUserId, String email, String fullName) {
    if (pendingUserId == null) {
      return;
    }

    List<Long> adminIds =
        jdbcTemplate.queryForList(
            "SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'", Long.class);
    if (adminIds.isEmpty()) {
      log.warn("No active admins found for user approval notification");
      return;
    }

    String displayName = fullName != null && !fullName.isBlank() ? fullName : email;
    String message = displayName + " (" + email + ") registered and is waiting for approval.";

    for (Long adminId : adminIds) {
      Notification notification =
          Notification.builder()
              .userId(adminId)
              .type(NotificationType.USER_APPROVAL)
              .title("New user pending approval")
              .message(message)
              .referenceType(NotificationReferenceType.USER)
              .referenceId(pendingUserId)
              .build();
      notificationRepository.save(notification);
      publishUnreadCount(adminId);
    }
  }

  @Transactional
  public void notifyIssueAssigned(Long assigneeId, Issue issue) {
    if (assigneeId == null || issue == null) {
      return;
    }

    String projectName = issue.getProject() != null ? issue.getProject().getName() : "a project";
    Notification notification =
        Notification.builder()
            .userId(assigneeId)
            .type(NotificationType.ISSUE_ASSIGNED)
            .title("Issue assigned to you")
            .message("You were assigned to \"" + issue.getTitle() + "\" in " + projectName)
            .referenceType(NotificationReferenceType.ISSUE)
            .referenceId(issue.getId())
            .projectId(issue.getProject() != null ? issue.getProject().getId() : null)
            .build();

    notificationRepository.save(notification);
    publishUnreadCount(assigneeId);
    log.debug("Created assignment notification for user {} issue {}", assigneeId, issue.getId());
  }

  @Transactional
  public void notifyIssueComment(Issue issue, Long actorUserId) {
    if (issue == null || actorUserId == null) {
      return;
    }

    String issueLabel = formatIssueLabel(issue);
    String projectName = issue.getProject() != null ? issue.getProject().getName() : "a project";
    notifyIssueStakeholders(
        issue,
        actorUserId,
        NotificationType.ISSUE_COMMENT,
        "New comment on " + issueLabel,
        "A comment was added to \"" + issue.getTitle() + "\" in " + projectName);
  }

  @Transactional
  public void notifyIssueStatusChanged(
      Issue issue, Long actorUserId, String fromStatus, String toStatus) {
    if (issue == null || actorUserId == null || fromStatus == null || toStatus == null) {
      return;
    }
    if (fromStatus.equals(toStatus)) {
      return;
    }

    String issueLabel = formatIssueLabel(issue);
    String projectName = issue.getProject() != null ? issue.getProject().getName() : "a project";
    notifyIssueStakeholders(
        issue,
        actorUserId,
        NotificationType.ISSUE_STATUS_CHANGED,
        issueLabel + " status updated",
        "Status changed from " + fromStatus + " to " + toStatus + " in " + projectName);
  }

  public Page<NotificationResponse> listForUser(
      Long userId, boolean unreadOnly, Pageable pageable) {
    Page<Notification> page =
        unreadOnly
            ? notificationRepository.findAllByUserIdAndReadAtIsNullOrderByCreatedAtDesc(
                userId, pageable)
            : notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable);
    return page.map(this::mapToResponse);
  }

  public long getUnreadCount(Long userId) {
    return notificationRepository.countByUserIdAndReadAtIsNull(userId);
  }

  @Transactional
  public NotificationResponse markAsRead(Long notificationId, Long userId) {
    Notification notification = findOwnedNotification(notificationId, userId);
    notification.setReadAt(LocalDateTime.now());
    return mapToResponse(notificationRepository.save(notification));
  }

  @Transactional
  public NotificationResponse markAsUnread(Long notificationId, Long userId) {
    Notification notification = findOwnedNotification(notificationId, userId);
    notification.setReadAt(null);
    return mapToResponse(notificationRepository.save(notification));
  }

  @Transactional
  public void markAllAsRead(Long userId) {
    LocalDateTime now = LocalDateTime.now();
    notificationRepository
        .findAllByUserIdAndReadAtIsNull(userId)
        .forEach(
            notification -> {
              notification.setReadAt(now);
              notificationRepository.save(notification);
            });
  }

  private void notifyIssueStakeholders(
      Issue issue, Long actorUserId, NotificationType type, String title, String message) {
    for (Long recipientId : resolveIssueStakeholderIds(issue, actorUserId)) {
      Notification notification =
          Notification.builder()
              .userId(recipientId)
              .type(type)
              .title(title)
              .message(message)
              .referenceType(NotificationReferenceType.ISSUE)
              .referenceId(issue.getId())
              .projectId(issue.getProject() != null ? issue.getProject().getId() : null)
              .build();
      notificationRepository.save(notification);
      publishUnreadCount(recipientId);
    }
  }

  private Set<Long> resolveIssueStakeholderIds(Issue issue, Long actorUserId) {
    Set<Long> recipients = new LinkedHashSet<>();
    if (issue.getAssigneeId() != null && !issue.getAssigneeId().equals(actorUserId)) {
      recipients.add(issue.getAssigneeId());
    }
    if (issue.getReporterId() != null
        && !issue.getReporterId().equals(actorUserId)
        && !issue.getReporterId().equals(issue.getAssigneeId())) {
      recipients.add(issue.getReporterId());
    }
    return recipients;
  }

  private String formatIssueLabel(Issue issue) {
    if (issue.getIssueKey() != null && !issue.getIssueKey().isBlank()) {
      return issue.getIssueKey();
    }
    return "Issue #" + issue.getId();
  }

  private Notification findOwnedNotification(Long notificationId, Long userId) {
    return notificationRepository
        .findByIdAndUserId(notificationId, userId)
        .orElseThrow(() -> AppException.notFound("Notification not found"));
  }

  private NotificationResponse mapToResponse(Notification notification) {
    return NotificationResponse.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .message(notification.getMessage())
        .read(notification.getReadAt() != null)
        .referenceType(notification.getReferenceType())
        .referenceId(notification.getReferenceId())
        .projectId(notification.getProjectId())
        .issueKey(resolveIssueKey(notification))
        .createdAt(notification.getCreatedAt())
        .build();
  }

  private String resolveIssueKey(Notification notification) {
    if (notification.getReferenceType() != NotificationReferenceType.ISSUE
        || notification.getReferenceId() == null) {
      return null;
    }
    return issueRepository
        .findById(notification.getReferenceId())
        .map(Issue::getIssueKey)
        .orElse(null);
  }

  private void publishUnreadCount(Long userId) {
    if (userId == null) {
      return;
    }
    long unread = notificationRepository.countByUserIdAndReadAtIsNull(userId);
    notificationStreamService.publishUnreadCount(userId, unread);
  }
}
