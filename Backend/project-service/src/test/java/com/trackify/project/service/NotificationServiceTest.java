package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trackify.project.dto.NotificationResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Notification;
import com.trackify.project.entity.Project;
import com.trackify.project.enums.NotificationReferenceType;
import com.trackify.project.enums.NotificationType;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock private NotificationRepository notificationRepository;
  @Mock private IssueRepository issueRepository;
  @Mock private NotificationStreamService notificationStreamService;
  @Mock private JdbcTemplate jdbcTemplate;

  @InjectMocks private NotificationService notificationService;

  @Test
  void notifyIssueAssigned_persistsNotification() {
    when(notificationRepository.countByUserIdAndReadAtIsNull(7L)).thenReturn(1L);
    Project project = Project.builder().id(3L).name("Alpha").build();
    Issue issue = Issue.builder().id(9L).title("Fix login").project(project).build();

    notificationService.notifyIssueAssigned(7L, issue);

    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
    verify(notificationRepository).save(captor.capture());
    Notification saved = captor.getValue();
    assertEquals(7L, saved.getUserId());
    assertEquals(NotificationType.ISSUE_ASSIGNED, saved.getType());
    assertEquals(NotificationReferenceType.ISSUE, saved.getReferenceType());
    assertEquals(9L, saved.getReferenceId());
    assertEquals(3L, saved.getProjectId());
  }

  @Test
  void markAsRead_setsReadAt() {
    Notification notification =
        Notification.builder().id(1L).userId(5L).title("Test").readAt(null).build();
    when(notificationRepository.findByIdAndUserId(1L, 5L)).thenReturn(Optional.of(notification));
    when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

    NotificationResponse response = notificationService.markAsRead(1L, 5L);

    assertTrue(response.isRead());
    verify(notificationRepository).save(notification);
    assertNotNull(notification.getReadAt());
  }

  @Test
  void getUnreadCount_returnsRepositoryCount() {
    when(notificationRepository.countByUserIdAndReadAtIsNull(5L)).thenReturn(3L);
    assertEquals(3L, notificationService.getUnreadCount(5L));
  }

  @Test
  void notifyUserApprovalPending_createsNotificationPerAdmin() {
    when(jdbcTemplate.queryForList(
            "SELECT id FROM users WHERE role = 'ADMIN' AND status = 'ACTIVE'", Long.class))
        .thenReturn(List.of(1L, 2L));
    when(notificationRepository.countByUserIdAndReadAtIsNull(any())).thenReturn(1L);

    notificationService.notifyUserApprovalPending(99L, "new@example.com", "New User");

    verify(notificationRepository, times(2)).save(any(Notification.class));
  }

  @Test
  void notifyIssueComment_notifiesAssigneeAndReporterExcludingActor() {
    when(notificationRepository.countByUserIdAndReadAtIsNull(any())).thenReturn(1L);
    Project project = Project.builder().id(3L).name("Alpha").build();
    Issue issue =
        Issue.builder()
            .id(9L)
            .issueKey("ALP-1")
            .title("Fix login")
            .project(project)
            .assigneeId(7L)
            .reporterId(8L)
            .build();

    notificationService.notifyIssueComment(issue, 10L);

    verify(notificationRepository, times(2)).save(any(Notification.class));
  }

  @Test
  void notifyIssueComment_skipsActorWhenTheyAreAssignee() {
    when(notificationRepository.countByUserIdAndReadAtIsNull(8L)).thenReturn(1L);
    Project project = Project.builder().id(3L).name("Alpha").build();
    Issue issue =
        Issue.builder()
            .id(9L)
            .issueKey("ALP-1")
            .title("Fix login")
            .project(project)
            .assigneeId(7L)
            .reporterId(8L)
            .build();

    notificationService.notifyIssueComment(issue, 7L);

    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
    verify(notificationRepository, times(1)).save(captor.capture());
    assertEquals(8L, captor.getValue().getUserId());
    assertEquals(NotificationType.ISSUE_COMMENT, captor.getValue().getType());
  }

  @Test
  void notifyIssueStatusChanged_notifiesStakeholders() {
    when(notificationRepository.countByUserIdAndReadAtIsNull(any())).thenReturn(1L);
    Project project = Project.builder().id(3L).name("Alpha").build();
    Issue issue =
        Issue.builder()
            .id(9L)
            .issueKey("ALP-2")
            .title("Deploy fix")
            .project(project)
            .assigneeId(7L)
            .reporterId(8L)
            .build();

    notificationService.notifyIssueStatusChanged(issue, 10L, "TODO", "IN_PROGRESS");

    verify(notificationRepository, times(2)).save(any(Notification.class));
  }

  @Test
  void listForUser_unreadOnly_usesUnreadQuery() {
    Notification unread =
        Notification.builder()
            .id(1L)
            .userId(2L)
            .title("Unread")
            .type(NotificationType.ISSUE_ASSIGNED)
            .createdAt(LocalDateTime.now())
            .build();
    when(notificationRepository.findAllByUserIdAndReadAtIsNullOrderByCreatedAtDesc(
            2L, PageRequest.of(0, 10)))
        .thenReturn(new PageImpl<>(List.of(unread)));

    var page = notificationService.listForUser(2L, true, PageRequest.of(0, 10));

    assertEquals(1, page.getTotalElements());
    assertFalse(page.getContent().get(0).isRead());
  }
}
