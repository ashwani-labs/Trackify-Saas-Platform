package com.trackify.project.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.trackify.project.dto.ActivityEventResponse;
import com.trackify.project.entity.ActivityEvent;
import com.trackify.project.entity.Issue;
import com.trackify.project.enums.ActivityEventType;
import com.trackify.project.repository.ActivityEventRepository;
import com.trackify.project.repository.IssueRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

  @Mock private ActivityEventRepository activityEventRepository;
  @Mock private IssueRepository issueRepository;

  @InjectMocks private ActivityService activityService;

  @Test
  void getProjectActivity_enrichesEventsWithIssueKeys() {
    ActivityEvent statusEvent =
        ActivityEvent.builder()
            .id(1L)
            .projectId(10L)
            .issueId(100L)
            .eventType(ActivityEventType.STATUS_CHANGED)
            .summary("Status changed from TODO to IN_PROGRESS")
            .createdAt(LocalDateTime.now())
            .build();
    ActivityEvent sprintEvent =
        ActivityEvent.builder()
            .id(2L)
            .projectId(10L)
            .issueId(null)
            .eventType(ActivityEventType.SPRINT_STARTED)
            .summary("Sprint \"Sprint 1\" started (#5)")
            .createdAt(LocalDateTime.now().minusHours(1))
            .build();

    Pageable pageable = PageRequest.of(0, 20);
    when(activityEventRepository.findAllByProjectIdOrderByCreatedAtDesc(10L, pageable))
        .thenReturn(new PageImpl<>(List.of(statusEvent, sprintEvent)));

    Issue issue = Issue.builder().id(100L).issueKey("PROJ-42").build();
    when(issueRepository.findAllById(List.of(100L))).thenReturn(List.of(issue));

    Page<ActivityEventResponse> page = activityService.getProjectActivity(10L, pageable);

    assertEquals(2, page.getTotalElements());
    assertEquals("PROJ-42", page.getContent().get(0).getIssueKey());
    assertNull(page.getContent().get(1).getIssueKey());
    verify(activityEventRepository).findAllByProjectIdOrderByCreatedAtDesc(10L, pageable);
  }

  @Test
  void getIssueActivity_returnsEventsForIssue() {
    ActivityEvent event =
        ActivityEvent.builder()
            .id(3L)
            .projectId(10L)
            .issueId(100L)
            .eventType(ActivityEventType.COMMENT_ADDED)
            .summary("Comment added")
            .createdAt(LocalDateTime.now())
            .build();
    when(activityEventRepository.findAllByIssueIdOrderByCreatedAtDesc(100L))
        .thenReturn(List.of(event));

    List<ActivityEventResponse> result = activityService.getIssueActivity(100L);

    assertEquals(1, result.size());
    assertEquals(ActivityEventType.COMMENT_ADDED, result.get(0).getEventType());
    assertNull(result.get(0).getIssueKey());
  }
}
