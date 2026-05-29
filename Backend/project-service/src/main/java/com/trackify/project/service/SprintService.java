package com.trackify.project.service;

import com.trackify.common.exception.AppException;
import com.trackify.project.dto.SprintRequest;
import com.trackify.project.dto.SprintResponse;
import com.trackify.project.entity.Issue;
import com.trackify.project.entity.Project;
import com.trackify.project.entity.Sprint;
import com.trackify.project.enums.IssueStatus;
import com.trackify.project.enums.SprintStatus;
import com.trackify.project.repository.IssueRepository;
import com.trackify.project.repository.ProjectRepository;
import com.trackify.project.repository.SprintRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SprintService {

  private final SprintRepository sprintRepository;
  private final ProjectRepository projectRepository;
  private final IssueRepository issueRepository;
  private final ActivityService activityService;

  @Transactional
  public SprintResponse createSprint(SprintRequest request) {
    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () ->
                    AppException.notFound("Project not found with id: " + request.getProjectId()));

    Sprint sprint =
        Sprint.builder()
            .name(request.getName())
            .goal(request.getGoal())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .status(SprintStatus.PLANNED)
            .project(project)
            .build();

    return mapToResponse(sprintRepository.save(sprint));
  }

  public List<SprintResponse> getSprintsByProject(Long projectId) {
    return sprintRepository.findByProjectId(projectId).stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public SprintResponse updateSprint(Long id, SprintRequest request) {
    Sprint sprint =
        sprintRepository
            .findById(id)
            .orElseThrow(() -> AppException.notFound("Sprint not found with id: " + id));

    sprint.setName(request.getName());
    sprint.setGoal(request.getGoal());
    sprint.setStartDate(request.getStartDate());
    sprint.setEndDate(request.getEndDate());

    return mapToResponse(sprintRepository.save(sprint));
  }

  @Transactional
  public SprintResponse startSprint(Long id) {
    Sprint sprint =
        sprintRepository
            .findById(id)
            .orElseThrow(() -> AppException.notFound("Sprint not found with id: " + id));

    if (sprint.getStatus() != SprintStatus.PLANNED) {
      throw new IllegalStateException("Only PLANNED sprints can be started.");
    }

    // Check if there is already an ACTIVE sprint for this project
    List<Sprint> activeSprints =
        sprintRepository.findByProjectIdAndStatus(sprint.getProject().getId(), SprintStatus.ACTIVE);
    if (!activeSprints.isEmpty()) {
      throw new IllegalStateException("Project already has an active sprint.");
    }

    sprint.setStatus(SprintStatus.ACTIVE);
    sprint = sprintRepository.save(sprint);
    activityService.recordSprintStarted(
        sprint.getProject().getId(), sprint.getId(), actorUserId, sprint.getName());
    return mapToResponse(sprint);
  }

  @Transactional
  public SprintResponse completeSprint(Long id, Long actorUserId) {
    Sprint sprint =
        sprintRepository
            .findById(id)
            .orElseThrow(() -> AppException.notFound("Sprint not found with id: " + id));

    if (sprint.getStatus() != SprintStatus.ACTIVE) {
      throw new IllegalStateException("Only ACTIVE sprints can be completed.");
    }

    sprint.setStatus(SprintStatus.COMPLETED);

    // Auto-migration: Move unfinished issues to next planned sprint or backlog
    List<Issue> unfinishedIssues =
        issueRepository.findAllBySprintId(id).stream()
            .filter(issue -> issue.getStatus() != IssueStatus.DONE)
            .collect(Collectors.toList());

    if (!unfinishedIssues.isEmpty()) {
      Sprint nextSprint =
          sprintRepository
              .findByProjectIdAndStatus(sprint.getProject().getId(), SprintStatus.PLANNED)
              .stream()
              .min(
                  (s1, s2) -> {
                    if (s1.getStartDate() == null || s2.getStartDate() == null)
                      return s1.getId().compareTo(s2.getId());
                    return s1.getStartDate().compareTo(s2.getStartDate());
                  })
              .orElse(null);

      for (Issue issue : unfinishedIssues) {
        issue.setSprint(nextSprint);
      }
      issueRepository.saveAll(unfinishedIssues);
    }

    sprint = sprintRepository.save(sprint);
    activityService.recordSprintCompleted(
        sprint.getProject().getId(), sprint.getId(), actorUserId, sprint.getName());
    return mapToResponse(sprint);
  }

  private SprintResponse mapToResponse(Sprint sprint) {
    return SprintResponse.builder()
        .id(sprint.getId())
        .name(sprint.getName())
        .goal(sprint.getGoal())
        .startDate(sprint.getStartDate())
        .endDate(sprint.getEndDate())
        .status(sprint.getStatus())
        .projectId(sprint.getProject() != null ? sprint.getProject().getId() : null)
        .createdAt(sprint.getCreatedAt())
        .updatedAt(sprint.getUpdatedAt())
        .build();
  }
}
