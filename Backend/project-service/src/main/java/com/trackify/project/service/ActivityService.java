package com.trackify.project.service;

import com.trackify.project.dto.ActivityEventResponse;
import com.trackify.project.entity.ActivityEvent;
import com.trackify.project.enums.ActivityEventType;
import com.trackify.project.repository.ActivityEventRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityService {

  private final ActivityEventRepository activityEventRepository;

  @Transactional
  public void recordStatusChanged(
      Long projectId, Long issueId, Long actorUserId, String fromStatus, String toStatus) {
    record(
        projectId,
        issueId,
        actorUserId,
        ActivityEventType.STATUS_CHANGED,
        "Status changed from " + fromStatus + " to " + toStatus);
  }

  @Transactional
  public void recordAssigneeChanged(
      Long projectId, Long issueId, Long actorUserId, Long fromAssignee, Long toAssignee) {
    String summary =
        toAssignee == null
            ? "Assignee cleared"
            : "Assignee changed"
                + (fromAssignee != null ? " from user #" + fromAssignee : "")
                + " to user #"
                + toAssignee;
    record(projectId, issueId, actorUserId, ActivityEventType.ASSIGNEE_CHANGED, summary);
  }

  @Transactional
  public void recordCommentAdded(Long projectId, Long issueId, Long actorUserId) {
    record(
        projectId,
        issueId,
        actorUserId,
        ActivityEventType.COMMENT_ADDED,
        "Comment added");
  }

  @Transactional
  public void recordSprintStarted(Long projectId, Long sprintId, Long actorUserId, String sprintName) {
    record(
        projectId,
        null,
        actorUserId,
        ActivityEventType.SPRINT_STARTED,
        "Sprint \"" + sprintName + "\" started (#" + sprintId + ")");
  }

  @Transactional
  public void recordSprintCompleted(
      Long projectId, Long sprintId, Long actorUserId, String sprintName) {
    record(
        projectId,
        null,
        actorUserId,
        ActivityEventType.SPRINT_COMPLETED,
        "Sprint \"" + sprintName + "\" completed (#" + sprintId + ")");
  }

  public List<ActivityEventResponse> getIssueActivity(Long issueId) {
    return activityEventRepository.findAllByIssueIdOrderByCreatedAtDesc(issueId).stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  private void record(
      Long projectId,
      Long issueId,
      Long actorUserId,
      ActivityEventType type,
      String summary) {
    activityEventRepository.save(
        ActivityEvent.builder()
            .projectId(projectId)
            .issueId(issueId)
            .actorUserId(actorUserId)
            .eventType(type)
            .summary(summary)
            .build());
  }

  private ActivityEventResponse mapToResponse(ActivityEvent event) {
    return ActivityEventResponse.builder()
        .id(event.getId())
        .projectId(event.getProjectId())
        .issueId(event.getIssueId())
        .actorUserId(event.getActorUserId())
        .eventType(event.getEventType())
        .summary(event.getSummary())
        .createdAt(event.getCreatedAt())
        .build();
  }
}
